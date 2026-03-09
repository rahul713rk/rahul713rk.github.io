# Session 17: Microservices Architecture

---

## Table of Contents

1. [Monolith vs Microservices](#monolith-vs-microservices)
2. [Microservices Design Principles](#microservices-design-principles)
3. [Service Discovery with Eureka](#service-discovery-with-eureka)
4. [API Gateway Pattern](#api-gateway-pattern)
5. [Inter-Service Communication](#inter-service-communication)
6. [Circuit Breaker with Resilience4j](#circuit-breaker-with-resilience4j)
7. [Centralized Configuration (Spring Cloud Config)](#centralized-configuration)
8. [Distributed Tracing](#distributed-tracing)
9. [Complete Project: E-Commerce Microservices](#complete-project)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Monolith vs Microservices

> 🏢 **Story: The Restaurant vs The Food Court**
> 
> **Monolith = Single Restaurant:** One kitchen handles ALL cuisines — Chinese, Italian, Indian. If the pasta station breaks, the ENTIRE kitchen shuts down. If you need to scale (more customers), you duplicate the ENTIRE kitchen — even parts you don't need.
> 
> **Microservices = Food Court:** Each stall is independent — the Chinese stall, the Pizza stall, the Chai stall. If the Pizza stall breaks, everyone else keeps running. Need more Chinese food? Just add another Chinese stall (scale independently). Each stall has its OWN chef, oven, and cashier.

```
┌── MONOLITH ────────────────────────┐    ┌── MICROSERVICES ──────────────────────────────────┐
│                                     │    │                                                    │
│  ┌─────────────────────────────┐   │    │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │    Single Application        │   │    │  │ User Svc │  │ Order Svc│  │Payment   │         │
│  │  ┌─────┬────────┬────────┐  │   │    │  │ Port 8081│  │ Port 8082│  │ Port 8083│         │
│  │  │Users│ Orders │Payment │  │   │    │  │ [MySQL]  │  │ [MongoDB]│  │ [Redis]  │         │
│  │  │     │        │        │  │   │    │  └──────────┘  └──────────┘  └──────────┘         │
│  │  └─────┴────────┴────────┘  │   │    │  ┌──────────┐  ┌──────────┐                       │
│  │     ONE Database             │   │    │  │ Notif Svc│  │Inventory │                       │
│  │     ONE Deployment           │   │    │  │ Port 8084│  │ Port 8085│                       │
│  └─────────────────────────────┘   │    │  │ [Kafka]  │  │ [Postgres]│                      │
│                                     │    │  └──────────┘  └──────────┘                       │
└─────────────────────────────────────┘    └────────────────────────────────────────────────────┘
```

| Aspect         | Monolith               | Microservices                       |
| -------------- | ---------------------- | ----------------------------------- |
| **Deployment** | One unit               | Independent services                |
| **Scaling**    | Scale entire app       | Scale specific services             |
| **Tech stack** | One language/framework | Each service can use different tech |
| **Database**   | Shared DB              | Database per service                |
| **Failure**    | One bug crashes all    | Failure isolated to one service     |
| **Team**       | One large team         | Small, autonomous teams             |
| **Complexity** | Simple to start        | Complex (networking, tracing, etc.) |
| **Best for**   | Small apps, MVPs       | Large, evolving systems             |

---

## Microservices Design Principles

1. **Single Responsibility:** Each service does ONE thing well
2. **Database per Service:** No shared databases — each service owns its data
3. **API-First:** Services communicate via well-defined APIs
4. **Decentralized Governance:** Teams choose their own tech stack
5. **Design for Failure:** Assume services WILL go down — use circuit breakers, retries
6. **Smart endpoints, dumb pipes:** Business logic in services, not in the network
7. **Infrastructure Automation:** CI/CD, containers, orchestration

---

## Service Discovery with Eureka

> 📞 **Story: The Phone Directory**
> 
> In a city, you don't memorize every shop's address. You look them up in the Yellow Pages (service registry). When a new shop opens, it registers its address. When a shop closes, it's removed. **Eureka** is the Yellow Pages for microservices — services register themselves, and other services look them up.

```java
// ═══════ EUREKA SERVER (Discovery Service) ═══════

// pom.xml
// <dependency>
//     <groupId>org.springframework.cloud</groupId>
//     <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
// </dependency>

// File: EurekaServerApplication.java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}

// application.yml for Eureka Server
// server:
//   port: 8761
// eureka:
//   client:
//     register-with-eureka: false  # Server doesn't register with itself
//     fetch-registry: false


// ═══════ EUREKA CLIENT (Any Microservice) ═══════

// pom.xml
// <dependency>
//     <groupId>org.springframework.cloud</groupId>
//     <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
// </dependency>

// application.yml for User Service
// spring:
//   application:
//     name: user-service       ← Service name (used for discovery)
// server:
//   port: 8081
// eureka:
//   client:
//     service-url:
//       defaultZone: http://localhost:8761/eureka/
```

```
Flow:
1. Eureka Server starts on port 8761
2. User-Service starts → registers with Eureka: "I'm USER-SERVICE at localhost:8081"
3. Order-Service starts → registers: "I'm ORDER-SERVICE at localhost:8082"
4. Order-Service needs User-Service → asks Eureka: "Where is USER-SERVICE?"
5. Eureka responds: "USER-SERVICE is at localhost:8081"
6. Order-Service calls http://localhost:8081/api/users/1
```

---

## API Gateway Pattern

> 🚪 **Story: The Hotel Reception**
> 
> Guests (clients) don't knock on every room door to find the right service. They go to the **reception** (API Gateway), which routes them to the right service. The reception also handles security badges (authentication), translates languages (request transformation), and limits how many visitors each department gets (rate limiting).

```java
// ═══════ API GATEWAY (Spring Cloud Gateway) ═══════

// pom.xml
// <dependency>
//     <groupId>org.springframework.cloud</groupId>
//     <artifactId>spring-cloud-starter-gateway</artifactId>
// </dependency>

// application.yml for Gateway
// server:
//   port: 8080
// spring:
//   cloud:
//     gateway:
//       routes:
//         - id: user-service
//           uri: lb://USER-SERVICE       ← Load-balanced (Eureka lookup)
//           predicates:
//             - Path=/api/users/**       ← Route matching
//           filters:
//             - StripPrefix=0
//         
//         - id: order-service
//           uri: lb://ORDER-SERVICE
//           predicates:
//             - Path=/api/orders/**
//           filters:
//             - StripPrefix=0
//         
//         - id: payment-service
//           uri: lb://PAYMENT-SERVICE
//           predicates:
//             - Path=/api/payments/**
```

```
Client Request                   API Gateway (port 8080)          Microservices
     │                                  │
     │  GET /api/users/1                │
     │─────────────────────────────────>│
     │                                  │──> Route: /api/users/** → USER-SERVICE
     │                                  │──> Eureka lookup: USER-SERVICE is at 8081
     │                                  │──> Forward to http://localhost:8081/api/users/1
     │                                  │
     │  POST /api/orders                │
     │─────────────────────────────────>│
     │                                  │──> Route: /api/orders/** → ORDER-SERVICE
     │                                  │──> Forward to http://localhost:8082/api/orders
```

---

## Inter-Service Communication

### Synchronous — REST calls with WebClient

```java
// File: OrderService.java (calls User Service)
@Service
public class OrderService {

    private final WebClient.Builder webClientBuilder;

    public OrderService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public OrderResponse createOrder(OrderRequest request) {
        // Call User Service to validate user exists
        UserDTO user = webClientBuilder.build()
                .get()
                .uri("http://USER-SERVICE/api/users/{id}", request.getUserId())
                .retrieve()
                .bodyToMono(UserDTO.class)
                .block(); // Synchronous wait

        if (user == null) {
            throw new RuntimeException("User not found: " + request.getUserId());
        }

        // Create order
        Order order = new Order(request.getUserId(), request.getItems(), user.getName());
        return orderRepository.save(order);
    }
}

// Register WebClient bean with load balancing
@Configuration
public class WebClientConfig {
    @Bean
    @LoadBalanced // Enables service name resolution via Eureka
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
```

### Asynchronous — Message Queues (RabbitMQ/Kafka)

```java
// ═══════ Producer (Order Service) ═══════
@Service
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishOrderCreated(Order order) {
        OrderEvent event = new OrderEvent(order.getId(), order.getUserId(), "CREATED");
        rabbitTemplate.convertAndSend("order.exchange", "order.created", event);
        System.out.println("📤 Published: ORDER_CREATED for " + order.getId());
    }
}

// ═══════ Consumer (Notification Service) ═══════
@Component
public class OrderEventConsumer {

    @RabbitListener(queues = "notification.queue")
    public void handleOrderCreated(OrderEvent event) {
        System.out.println("📥 Received: " + event.getEventType() + " for order " + event.getOrderId());
        // Send email, SMS, push notification...
    }
}
```

| Aspect      | Synchronous (REST)             | Asynchronous (Message Queue)           |
| ----------- | ------------------------------ | -------------------------------------- |
| Coupling    | Tight — caller waits           | Loose — fire and forget                |
| Latency     | Higher (blocked)               | Lower (non-blocking)                   |
| Reliability | If service is down, call fails | Message queued, processed later        |
| Use case    | Real-time queries              | Events, notifications, background jobs |

---

## Circuit Breaker with Resilience4j

> 🏠 **Story: The Electrical Circuit Breaker**
> 
> When too much current flows through a wire, the circuit breaker TRIPS and cuts the power — preventing a fire. Similarly, when a microservice keeps failing (e.g., timeout, 500 errors), the **circuit breaker** opens and stops sending requests — preventing cascade failures. After a cooldown, it lets a few test requests through (half-open). If they succeed, the circuit closes again.

```java
// pom.xml
// <dependency>
//     <groupId>io.github.resilience4j</groupId>
//     <artifactId>resilience4j-spring-boot3</artifactId>
// </dependency>

@Service
public class PaymentService {

    private final WebClient.Builder webClient;

    // Circuit breaker wraps external calls
    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    @Retry(name = "paymentService") // Retry 3 times before circuit opens
    public PaymentResponse processPayment(PaymentRequest request) {
        return webClient.build()
                .post()
                .uri("http://PAYMENT-GATEWAY/api/charge")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PaymentResponse.class)
                .block();
    }

    // Fallback — called when circuit is OPEN or all retries fail
    public PaymentResponse paymentFallback(PaymentRequest request, Throwable t) {
        System.out.println("⚠️ Payment service unavailable: " + t.getMessage());
        return new PaymentResponse("PENDING", "Payment queued for retry");
    }
}

// application.yml
// resilience4j:
//   circuitbreaker:
//     instances:
//       paymentService:
//         sliding-window-size: 10        # Monitor last 10 calls
//         failure-rate-threshold: 50     # Open if 50%+ fail
//         wait-duration-in-open-state: 30s  # Wait 30s before half-open
//         permitted-number-of-calls-in-half-open-state: 3
//   retry:
//     instances:
//       paymentService:
//         max-attempts: 3
//         wait-duration: 2s
```

```
Circuit States:
CLOSED ──(failures > threshold)──> OPEN ──(timeout)──> HALF-OPEN
  ▲                                                        │
  └──────────────(test calls succeed)──────────────────────┘
```

---

## Centralized Configuration

```
Problem: 10 microservices × 3 environments (dev/staging/prod) = 30 config files!
Solution: ONE central config server.

┌───────────────────┐
│ Config Server     │ ← Reads from Git repo
│ (Spring Cloud     │    /config-repo/user-service-dev.yml
│  Config)          │    /config-repo/order-service-prod.yml
└────────┬──────────┘
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
User-Svc  Order-Svc  Payment-Svc
(fetches   (fetches   (fetches
 config)    config)    config)
```

---

## Complete Project: E-Commerce Microservices

```
System Architecture:

                    ┌─────────────────┐
                    │   API Gateway   │ (port 8080)
                    │Spring Cloud GW  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Service │    │ Order Service│    │Product Svc   │
│  port 8081   │    │  port 8082   │    │  port 8083   │
│ [MySQL]      │    │ [MongoDB]    │    │ [PostgreSQL] │
└──────────────┘    └──────┬───────┘    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │  RabbitMQ    │ (Event Bus)
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
        ┌──────────────┐    ┌──────────────┐
        │Notification  │    │Inventory Svc │
        │  Service     │    │  port 8085   │
        │  port 8084   │    │ [Redis]      │
        └──────────────┘    └──────────────┘

        All services register with Eureka Server (port 8761)
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: When should you NOT use microservices?**

**A:** Avoid microservices when: small team (< 5 devs), simple domain, MVP/prototype stage, insufficient DevOps maturity, or when the team lacks distributed systems experience. Start monolith, extract microservices WHEN needed (the "monolith first" approach). Premature microservices = unnecessary complexity.

---

**Q2: How do microservices communicate? Compare sync vs async.**

**A:** **Synchronous (REST/gRPC):** Direct request-response. Simple but creates coupling — if the called service is down, the caller fails. Use for: real-time queries. **Asynchronous (message queues):** Services publish events; others consume when ready. Decoupled and resilient — messages are queued if consumer is down. Use for: events, notifications, eventual consistency.

---

### Medium-Hard Questions

**Q3: What is the Saga pattern and why is it needed?**

**A:** In a monolith, a single DB transaction ensures ACID across tables. In microservices, each service has its OWN DB — you can't do a distributed transaction across databases easily.

The **Saga pattern** breaks a distributed transaction into a sequence of local transactions:

1. Order Service creates order (local TX)
2. Payment Service charges payment (local TX)
3. Inventory Service reserves stock (local TX)

If step 3 fails → **compensating transactions**: refund payment (step 2 undo), cancel order (step 1 undo).

Two types: **Choreography** (events trigger next step) and **Orchestration** (a central coordinator manages the flow).

---

**Q4: What is the difference between API Gateway and Load Balancer?**

**A:**

- **Load Balancer:** Distributes traffic across INSTANCES of the SAME service (e.g., 3 copies of User Service). Works at L4 (TCP) or L7 (HTTP). Doesn't understand the API.
- **API Gateway:** Routes requests to DIFFERENT services based on the URL path. Also handles cross-cutting concerns: authentication, rate limiting, request transformation, response aggregation. Works at L7 only.

In practice, you have BOTH: API Gateway routes to the right service, and the load balancer distributes within that service.

---

**Q5: How do you handle data consistency across microservices?**

**A:**

1. **Eventual consistency:** Accept that data won't be instantly consistent. Use events (Kafka/RabbitMQ) to propagate changes. Most microservices systems use this.
2. **Saga pattern:** Coordinate distributed transactions with compensating actions.
3. **CQRS (Command Query Responsibility Segregation):** Separate write model from read model. Write to the source, read from a denormalized view updated via events.
4. **Outbox pattern:** Write to the database AND an outbox table in the same transaction. A separate process publishes outbox events to the message queue — guarantees at-least-once delivery.

---

> 🎯 **Session 17 Summary:** You've mastered the transition from monolith to microservices, service discovery (Eureka), API Gateway (Spring Cloud Gateway), inter-service communication (REST vs messaging), circuit breakers (Resilience4j), and centralized configuration. Microservices are complex but essential for large-scale backend systems!
