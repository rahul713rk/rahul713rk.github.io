# Session 21: Message Queues — Kafka & RabbitMQ

---

## Table of Contents

1. [Why Message Queues?](#why-message-queues)
2. [Message Queue Concepts](#message-queue-concepts)
3. [RabbitMQ](#rabbitmq)
4. [Apache Kafka](#apache-kafka)
5. [RabbitMQ vs Kafka](#rabbitmq-vs-kafka)
6. [Spring Boot + Kafka Integration](#spring-boot--kafka)
7. [Spring Boot + RabbitMQ Integration](#spring-boot--rabbitmq)
8. [Event-Driven Architecture](#event-driven-architecture)
9. [Interview Questions & Answers](#interview-questions--answers)

---

## Why Message Queues?

> 📬 **Story: The Post Office**
> 
> Without a post office, you'd have to personally walk to every friend's house to deliver a letter (synchronous). If they're not home, you wait (blocking). If 100 people want to send letters simultaneously, there's a traffic jam.
> 
> A **post office** (message queue) accepts all letters, stores them, and delivers them when the recipient is ready. The sender drops the letter and walks away (fire-and-forget). The recipient picks it up when convenient (asynchronous).

```
Synchronous (REST):              Asynchronous (Message Queue):
Order Svc ──> Payment Svc        Order Svc ──> [Queue] ──> Payment Svc
    │ waits...                        │ returns immediately
    │ blocked until response          │ continues working
    └── response comes back           Queue delivers when consumer is ready
```

**Benefits:**

1. **Decoupling** — Services don't know about each other
2. **Resilience** — If consumer is down, messages are stored, not lost
3. **Scalability** — Add more consumers to handle load
4. **Load leveling** — Queue absorbs traffic spikes
5. **Async processing** — Sender doesn't wait for processing

---

## Message Queue Concepts

```
PRODUCER ──> [MESSAGE QUEUE / BROKER] ──> CONSUMER

Producer:  Sends messages (publishes events)
Broker:    Stores and routes messages (RabbitMQ, Kafka)
Consumer:  Receives and processes messages (subscribes to events)
Queue:     FIFO storage for messages
Topic:     Named channel for pub/sub (multiple consumers)
Exchange:  Routes messages to queues based on rules (RabbitMQ)
Partition: Divide a topic for parallelism (Kafka)
```

---

## RabbitMQ

```
RabbitMQ Architecture:

Producer ──> Exchange ──(routing)──> Queue ──> Consumer

Exchange Types:
┌──────────────┬─────────────────────────────────┐
│ Direct       │ Route by exact routing key       │
│ Fanout       │ Broadcast to ALL bound queues    │
│ Topic        │ Route by pattern (*.error, #)    │
│ Headers      │ Route by message headers         │
└──────────────┴─────────────────────────────────┘
```

```java
// ═══════ RabbitMQ Configuration ═══════
@Configuration
public class RabbitMQConfig {

    // Queue
    @Bean
    public Queue orderQueue() {
        return new Queue("order.queue", true); // durable = true
    }

    // Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange("order.exchange");
    }

    // Binding: route messages with key "order.created" to orderQueue
    @Bean
    public Binding orderBinding(Queue orderQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderQueue).to(orderExchange).with("order.created");
    }
}

// ═══════ Producer ═══════
@Service
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(Order order) {
        OrderEvent event = new OrderEvent(order.getId(), order.getUserId(), 
                                          order.getTotal(), "CREATED");
        rabbitTemplate.convertAndSend("order.exchange", "order.created", event);
        System.out.println("📤 Published ORDER_CREATED: " + order.getId());
    }
}

// ═══════ Consumer ═══════
@Component
public class PaymentConsumer {

    @RabbitListener(queues = "order.queue")
    public void handleOrderCreated(OrderEvent event) {
        System.out.println("📥 Received: " + event);
        // Process payment...
        System.out.println("💳 Payment processed for order: " + event.getOrderId());
    }
}
```

---

## Apache Kafka

```
Kafka Architecture:

Producer ──> Topic [Partition 0] ──> Consumer Group A (Consumer 1, Consumer 2)
                   [Partition 1] ──> Consumer Group B (Consumer 3)
                   [Partition 2]

Key Concepts:
┌──────────────────────────────────────────────────────────┐
│  Topic:          Named stream of records (like a table)   │
│  Partition:      Subset of a topic (parallelism unit)     │
│  Offset:         Position of a message in a partition     │
│  Consumer Group: Set of consumers that share the work     │
│  Broker:         Kafka server instance                    │
│  Replication:    Copies of partitions for fault tolerance │
└──────────────────────────────────────────────────────────┘

Key Difference from RabbitMQ:
- Kafka RETAINS messages even after consumption (configurable retention)
- Messages are PULLED by consumers (not pushed)
- Designed for HIGH-THROUGHPUT streaming (millions of messages/sec)
```

---

## Spring Boot + Kafka

```properties
# application.properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=my-app-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
```

```java
// ═══════ Kafka Producer ═══════
@Service
public class KafkaOrderProducer {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public KafkaOrderProducer(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderEvent(OrderEvent event) {
        // Topic, Key (for partitioning), Value
        kafkaTemplate.send("order-events", event.getOrderId(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        System.out.println("📤 Sent to partition " + 
                            result.getRecordMetadata().partition() + 
                            " offset " + result.getRecordMetadata().offset());
                    } else {
                        System.err.println("❌ Failed: " + ex.getMessage());
                    }
                });
    }
}

// ═══════ Kafka Consumer ═══════
@Component
public class KafkaOrderConsumer {

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void handleOrderEvent(OrderEvent event) {
        System.out.println("📥 Payment service received: " + event);
        // Process payment
    }

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void handleNotification(OrderEvent event) {
        System.out.println("📥 Notification service received: " + event);
        // Send email/SMS
    }
    // Both consumer groups receive EVERY message independently!
}
```

---

## RabbitMQ vs Kafka

| Aspect                | RabbitMQ                    | Kafka                        |
| --------------------- | --------------------------- | ---------------------------- |
| **Model**             | Message Queue (push)        | Event Log (pull)             |
| **Message retention** | Deleted after consumption   | Retained (configurable)      |
| **Throughput**        | ~10K msg/sec                | ~1M msg/sec                  |
| **Ordering**          | Per queue                   | Per partition                |
| **Replay**            | ❌                           | ✅ Re-read old messages       |
| **Routing**           | Complex (exchanges)         | Simple (topics + partitions) |
| **Use case**          | Task queues, RPC            | Event streaming, analytics   |
| **Complexity**        | Simpler                     | More complex                 |
| **Best for**          | Traditional async messaging | Real-time data pipelines     |

---

## Event-Driven Architecture

```java
// Using Spring's built-in event system (for monolith/simple cases)

// Event class
public class UserRegisteredEvent {
    private final Long userId;
    private final String email;
    private final String name;
    // Constructor, getters...
}

// Publisher
@Service
public class UserService {
    private final ApplicationEventPublisher eventPublisher;

    public User registerUser(CreateUserRequest request) {
        User user = userRepository.save(new User(request.getName(), request.getEmail()));

        // Publish event — decoupled from what happens next!
        eventPublisher.publishEvent(new UserRegisteredEvent(user.getId(), 
                                                             user.getEmail(), 
                                                             user.getName()));
        return user;
    }
}

// Listeners (multiple, independent handlers)
@Component
class WelcomeEmailHandler {
    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        System.out.println("📧 Sending welcome email to " + event.getEmail());
    }
}

@Component
class AuditLogHandler {
    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        System.out.println("📝 Audit: User " + event.getUserId() + " registered");
    }
}

@Component
class AnalyticsHandler {
    @Async // Run in a separate thread
    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        System.out.println("📊 Analytics: New user signup recorded");
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between a message queue and a pub/sub system?**

**A:** In a **message queue** (point-to-point), each message is consumed by EXACTLY ONE consumer. Used for task distribution (e.g., process payment). In **pub/sub** (publish-subscribe), each message is delivered to ALL subscribers. Used for notifications (e.g., order created → email + analytics + inventory all receive it). Kafka supports both: within a consumer group it's point-to-point; across consumer groups it's pub/sub.

---

### Medium-Hard Questions

**Q2: How do you ensure message ordering in Kafka?**

**A:** Kafka guarantees ordering ONLY within a single partition. To ensure ordering for related messages (e.g., all events for order #123), use the same partition key (order ID). All messages with the same key go to the same partition → processed in order.

**Q3: What is the difference between at-most-once, at-least-once, and exactly-once delivery?**

**A:**

- **At-most-once:** Message may be lost, never duplicated. Commit offset BEFORE processing. If consumer crashes during processing, message is lost.
- **At-least-once:** Message is never lost, may be duplicated. Commit offset AFTER processing. If consumer crashes after processing but before commit, message is reprocessed.
- **Exactly-once:** Message is processed exactly once. Requires idempotent consumers + transactional producers (Kafka supports this with `enable.idempotence=true`).

In practice: use at-least-once + idempotent consumers (use unique message ID to detect duplicates).

---

> 🎯 **Session 21 Summary:** You've mastered message queues (why, when, how), RabbitMQ (exchanges, queues, bindings), Kafka (topics, partitions, consumer groups), Spring Boot integration with both, and event-driven architecture. Async messaging is crucial for scalable, resilient microservices!
