---
title: "Session 16: Design Patterns for Backend Development"
description: "Step 12 of Java Backend Guide: Session 16: Design Patterns for Backend Development."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 12
---

---

## Table of Contents

1. [Why Design Patterns?](#why-design-patterns)
2. [Singleton Pattern](#singleton-pattern)
3. [Factory Pattern](#factory-pattern)
4. [Builder Pattern](#builder-pattern)
5. [Observer Pattern](#observer-pattern)
6. [Strategy Pattern](#strategy-pattern)
7. [Decorator Pattern](#decorator-pattern)
8. [Repository Pattern](#repository-pattern)
9. [DTO & Mapper Pattern](#dto--mapper-pattern)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Why Design Patterns?

> 🏗️ **Story: The Master Builder's Playbook**
> 
> Long ago, a master builder noticed that every city he visited faced the same structural problems — bridges collapsing, buildings leaking, roads cracking. He wrote a **playbook** of proven solutions: "For river crossings, use an arch bridge. For tall buildings, use a steel frame. For wet areas, use elevated foundations."
> 
> **Design Patterns** are the software builder's playbook — proven, reusable solutions to common programming problems. You don't reinvent the wheel; you pick the right pattern for the right problem.

### Pattern Categories

| Category       | Purpose                  | Examples                     |
| -------------- | ------------------------ | ---------------------------- |
| **Creational** | How objects are created  | Singleton, Factory, Builder  |
| **Structural** | How objects are composed | Decorator, Adapter, Proxy    |
| **Behavioral** | How objects communicate  | Observer, Strategy, Template |

---

## Singleton Pattern

> ☕ **Story: The Office Coffee Machine**
> 
> An office has ONE coffee machine for 100 employees. It would be wasteful (and chaotic!) to have 100 coffee machines. Everyone shares the SAME machine. The **Singleton Pattern** ensures a class has exactly ONE instance, accessible globally.

```java
// File: SingletonPatterns.java

// ===== 1. Eager Initialization (simplest, thread-safe) =====
class AppConfig {
    // Instance created when class is LOADED (JVM guarantees thread safety)
    private static final AppConfig INSTANCE = new AppConfig();

    private String appName = "MyApp";
    private int maxConnections = 10;

    private AppConfig() {} // Private constructor — no external instantiation

    public static AppConfig getInstance() {
        return INSTANCE;
    }

    public String getAppName() { return appName; }
    public int getMaxConnections() { return maxConnections; }
}

// ===== 2. Lazy Initialization with Double-Checked Locking =====
class DatabasePool {
    // volatile ensures visibility across threads
    private static volatile DatabasePool instance;
    private int poolSize;

    private DatabasePool() {
        poolSize = 10;
        System.out.println("Creating connection pool...");
    }

    public static DatabasePool getInstance() {
        if (instance == null) {                    // First check (no lock)
            synchronized (DatabasePool.class) {    // Lock only when needed
                if (instance == null) {            // Second check (with lock)
                    instance = new DatabasePool();
                }
            }
        }
        return instance;
    }
}

// ===== 3. Enum Singleton (Joshua Bloch recommended) =====
enum Logger {
    INSTANCE; // Only one instance, ever! Thread-safe, serialization-safe

    public void log(String message) {
        System.out.println("[LOG] " + message);
    }
}

// ===== In Spring — Beans are Singleton by default! =====
// @Service, @Component, @Repository → Spring creates ONE instance and shares it
```

---

## Factory Pattern

> 🏭 **Story: The Pizza Shop**
> 
> You walk into Domino's and say "I want a Margherita." You DON'T go to the kitchen and make it yourself. The **counter** (factory) takes your order and produces the right pizza. You get back a `Pizza` — you don't care HOW it was made.

```java
// File: FactoryPatternDemo.java

// Product interface
interface Notification {
    void send(String to, String message);
}

// Concrete products
class EmailNotification implements Notification {
    @Override
    public void send(String to, String message) {
        System.out.println("📧 Email to " + to + ": " + message);
    }
}

class SmsNotification implements Notification {
    @Override
    public void send(String to, String message) {
        System.out.println("📱 SMS to " + to + ": " + message);
    }
}

class PushNotification implements Notification {
    @Override
    public void send(String to, String message) {
        System.out.println("🔔 Push to " + to + ": " + message);
    }
}

// Factory — decides which class to instantiate
class NotificationFactory {
    public static Notification create(String type) {
        return switch (type.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS" -> new SmsNotification();
            case "PUSH" -> new PushNotification();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

// Usage
public class FactoryPatternDemo {
    public static void main(String[] args) {
        // Client code doesn't know concrete classes!
        Notification notif = NotificationFactory.create("EMAIL");
        notif.send("amit@example.com", "Your order is shipped!");

        Notification sms = NotificationFactory.create("SMS");
        sms.send("+91-9876543210", "OTP: 123456");
    }
}
```

**In Spring:** The IoC container IS a factory — `applicationContext.getBean(UserService.class)` creates/returns the right instance.

---

## Builder Pattern

> 🍔 **Story: The Custom Burger**
> 
> At a burger joint, you don't get a fixed burger — you CHOOSE: "Add cheese, no pickles, extra sauce, sesame bun." The **builder** assembles your custom burger step by step. The Builder Pattern lets you construct complex objects step by step, especially when there are many optional parameters.

```java
// File: BuilderPatternDemo.java

class HttpRequest {
    private final String url;           // Required
    private final String method;        // Required
    private final Map<String, String> headers;
    private final String body;
    private final int timeout;
    private final boolean followRedirects;

    // Private constructor — only Builder can create instances
    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = builder.headers;
        this.body = builder.body;
        this.timeout = builder.timeout;
        this.followRedirects = builder.followRedirects;
    }

    @Override
    public String toString() {
        return String.format("%s %s\nHeaders: %s\nBody: %s\nTimeout: %dms",
                           method, url, headers, body, timeout);
    }

    // Static inner Builder class
    public static class Builder {
        private final String url;      // Required
        private final String method;   // Required
        private Map<String, String> headers = new HashMap<>();
        private String body;
        private int timeout = 5000;
        private boolean followRedirects = true;

        public Builder(String url, String method) {
            this.url = url;
            this.method = method;
        }

        public Builder header(String key, String value) {
            headers.put(key, value);
            return this; // Return 'this' for chaining!
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public Builder timeout(int ms) {
            this.timeout = ms;
            return this;
        }

        public Builder followRedirects(boolean follow) {
            this.followRedirects = follow;
            return this;
        }

        public HttpRequest build() {
            // Validation before creating
            if (url == null || url.isBlank()) throw new IllegalStateException("URL required");
            return new HttpRequest(this);
        }
    }
}

// Usage — clean, readable, flexible!
public class BuilderPatternDemo {
    public static void main(String[] args) {
        HttpRequest request = new HttpRequest.Builder("https://api.example.com/users", "POST")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer token123")
                .body("{\"name\": \"Amit\"}")
                .timeout(3000)
                .build();

        System.out.println(request);
    }
}
// Lombok makes this even simpler: @Builder annotation on the class!
```

---

## Observer Pattern

> 📰 **Story: The Newspaper Subscription**
> 
> You subscribe to a newspaper. Every morning, the newspaper (subject/publisher) automatically delivers to ALL subscribers. When you unsubscribe, deliveries stop. The newspaper doesn't know what each subscriber does with it — some read it, some recycle it. This is the **Observer pattern** — when one object changes, all registered observers are notified automatically.

```java
// File: ObserverPatternDemo.java
import java.util.*;

// Observer interface
interface EventListener {
    void update(String eventType, String data);
}

// Subject (Publisher)
class EventManager {
    private Map<String, List<EventListener>> listeners = new HashMap<>();

    public void subscribe(String eventType, EventListener listener) {
        listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
    }

    public void unsubscribe(String eventType, EventListener listener) {
        listeners.getOrDefault(eventType, List.of()).remove(listener);
    }

    public void notify(String eventType, String data) {
        listeners.getOrDefault(eventType, List.of())
                .forEach(listener -> listener.update(eventType, data));
    }
}

// Concrete Observers
class EmailAlert implements EventListener {
    @Override
    public void update(String eventType, String data) {
        System.out.println("📧 Email Alert [" + eventType + "]: " + data);
    }
}

class SlackNotifier implements EventListener {
    @Override
    public void update(String eventType, String data) {
        System.out.println("💬 Slack [" + eventType + "]: " + data);
    }
}

class AuditLogger implements EventListener {
    @Override
    public void update(String eventType, String data) {
        System.out.println("📝 Audit Log [" + eventType + "]: " + data);
    }
}

// Usage
class OrderService {
    private EventManager events = new EventManager();

    public EventManager getEvents() { return events; }

    public void placeOrder(String orderId) {
        System.out.println("✅ Order placed: " + orderId);
        events.notify("ORDER_PLACED", orderId);
    }

    public void cancelOrder(String orderId) {
        System.out.println("❌ Order cancelled: " + orderId);
        events.notify("ORDER_CANCELLED", orderId);
    }
}

public class ObserverPatternDemo {
    public static void main(String[] args) {
        OrderService orderService = new OrderService();

        // Subscribe observers
        orderService.getEvents().subscribe("ORDER_PLACED", new EmailAlert());
        orderService.getEvents().subscribe("ORDER_PLACED", new SlackNotifier());
        orderService.getEvents().subscribe("ORDER_PLACED", new AuditLogger());
        orderService.getEvents().subscribe("ORDER_CANCELLED", new EmailAlert());

        orderService.placeOrder("ORD-001"); // All 3 observers notified
        System.out.println();
        orderService.cancelOrder("ORD-001"); // Only EmailAlert notified
    }
}
```

**In Spring:** `ApplicationEvent` and `@EventListener` implement this pattern natively.

---

## Strategy Pattern

> 🗺️ **Story: The Navigation App**
> 
> Google Maps gives you THREE route strategies: driving, walking, cycling. The destination is the SAME — but the algorithm to get there is DIFFERENT. You pick the strategy at runtime. The **Strategy Pattern** lets you define a family of algorithms and make them interchangeable.

```java
// File: StrategyPatternDemo.java

// Strategy interface
interface PaymentStrategy {
    void pay(double amount);
    String getName();
}

// Concrete strategies
class CreditCardPayment implements PaymentStrategy {
    private String cardNumber;

    CreditCardPayment(String cardNumber) { this.cardNumber = cardNumber; }

    @Override
    public void pay(double amount) {
        System.out.println("💳 Paid ₹" + amount + " via Credit Card ending " + 
                         cardNumber.substring(cardNumber.length() - 4));
    }

    @Override
    public String getName() { return "Credit Card"; }
}

class UpiPayment implements PaymentStrategy {
    private String upiId;

    UpiPayment(String upiId) { this.upiId = upiId; }

    @Override
    public void pay(double amount) {
        System.out.println("📱 Paid ₹" + amount + " via UPI: " + upiId);
    }

    @Override
    public String getName() { return "UPI"; }
}

class WalletPayment implements PaymentStrategy {
    @Override
    public void pay(double amount) {
        System.out.println("👛 Paid ₹" + amount + " via Wallet");
    }

    @Override
    public String getName() { return "Wallet"; }
}

// Context — uses the strategy
class PaymentProcessor {
    private PaymentStrategy strategy; // Can change at runtime!

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void processPayment(double amount) {
        if (strategy == null) throw new IllegalStateException("No payment strategy set!");
        System.out.println("Processing payment via " + strategy.getName() + "...");
        strategy.pay(amount);
    }
}

// Usage
public class StrategyPatternDemo {
    public static void main(String[] args) {
        PaymentProcessor processor = new PaymentProcessor();

        // Customer chooses payment method at runtime
        processor.setStrategy(new CreditCardPayment("4111111111111234"));
        processor.processPayment(1500);

        System.out.println();

        processor.setStrategy(new UpiPayment("amit@paytm"));
        processor.processPayment(500);
    }
}
```

---

## Decorator Pattern

> 🍦 **Story: The Ice Cream Toppings**
> 
> You order vanilla ice cream (base). Then add chocolate syrup (decorator 1). Then add sprinkles (decorator 2). Then add whipped cream (decorator 3). Each topping WRAPS the previous one, adding behavior WITHOUT modifying the original.

```java
// File: DecoratorPatternDemo.java

interface Coffee {
    double getCost();
    String getDescription();
}

class BasicCoffee implements Coffee {
    @Override public double getCost() { return 100; }
    @Override public String getDescription() { return "Basic Coffee"; }
}

// Abstract Decorator
abstract class CoffeeDecorator implements Coffee {
    protected Coffee wrappedCoffee;

    CoffeeDecorator(Coffee coffee) { this.wrappedCoffee = coffee; }
}

class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee coffee) { super(coffee); }

    @Override public double getCost() { return wrappedCoffee.getCost() + 30; }
    @Override public String getDescription() { return wrappedCoffee.getDescription() + " + Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
    SugarDecorator(Coffee coffee) { super(coffee); }

    @Override public double getCost() { return wrappedCoffee.getCost() + 10; }
    @Override public String getDescription() { return wrappedCoffee.getDescription() + " + Sugar"; }
}

class WhippedCreamDecorator extends CoffeeDecorator {
    WhippedCreamDecorator(Coffee coffee) { super(coffee); }

    @Override public double getCost() { return wrappedCoffee.getCost() + 50; }
    @Override public String getDescription() { return wrappedCoffee.getDescription() + " + Whipped Cream"; }
}

public class DecoratorPatternDemo {
    public static void main(String[] args) {
        Coffee coffee = new BasicCoffee();                  // ₹100
        coffee = new MilkDecorator(coffee);                 // ₹130
        coffee = new SugarDecorator(coffee);                // ₹140
        coffee = new WhippedCreamDecorator(coffee);         // ₹190

        System.out.println(coffee.getDescription()); // Basic Coffee + Milk + Sugar + Whipped Cream
        System.out.println("Total: ₹" + coffee.getCost()); // ₹190
    }
}
```

**In Java:** `BufferedReader(new FileReader())` — BufferedReader DECORATES FileReader with buffering capability.

---

## DTO & Mapper Pattern

```java
// File: DTOPatternDemo.java

// Entity (maps to database — has internal fields you don't want to expose)
@Entity
class UserEntity {
    @Id private Long id;
    private String name;
    private String email;
    private String passwordHash;     // Never expose this!
    private String internalNotes;    // Never expose this!
    private LocalDateTime createdAt;
    // Getters, setters...
}

// DTO (Data Transfer Object — what the API returns)
class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String memberSince;
    // Getters, setters, constructors...
}

// Create Request DTO (what the API accepts)
class CreateUserRequest {
    private String name;
    private String email;
    private String password;
    // Getters, setters...
}

// Mapper — converts between Entity and DTO
class UserMapper {
    public static UserDTO toDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        dto.setMemberSince(entity.getCreatedAt().toString());
        // passwordHash and internalNotes are NOT copied — hidden from API
        return dto;
    }

    public static UserEntity toEntity(CreateUserRequest request) {
        UserEntity entity = new UserEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPasswordHash(BCrypt.encode(request.getPassword()));
        return entity;
    }
}

// Controller returns DTO, not Entity!
@RestController
class UserController {
    @GetMapping("/api/users/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        UserEntity entity = userService.findById(id);
        return UserMapper.toDTO(entity); // Safe — no password exposed
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between Factory and Abstract Factory patterns?**

**A:** **Factory** creates ONE type of product (e.g., `NotificationFactory.create("EMAIL")`). **Abstract Factory** creates a FAMILY of related products (e.g., `UIFactory.createButton()`, `UIFactory.createTextField()`, `UIFactory.createCheckbox()` — where one factory creates MacOS widgets and another creates Windows widgets).

---

**Q2: When would you use the Builder pattern vs Constructor?**

**A:** Use Builder when: many optional parameters (avoids telescoping constructors), immutable objects with complex initialization, or validation needed before construction. Use constructor when: few required parameters, simple objects. In Spring Boot, the `ResponseEntity.ok().header("X-Header", "value").body(data)` is a builder pattern.

---

### Medium-Hard Questions

**Q3: How are design patterns used in the Spring Framework?**

**A:**

- **Singleton** — Spring beans are singleton by default
- **Factory** — `BeanFactory`, `ApplicationContext` create beans
- **Proxy** — `@Transactional`, `@Cacheable` use dynamic proxies
- **Template Method** — `JdbcTemplate`, `RestTemplate`
- **Observer** — `ApplicationEvent` and `@EventListener`
- **Strategy** — `HandlerMapping` (different URL resolution strategies)
- **Decorator** — `HttpServletRequestWrapper`

---

**Q4: Why is the Singleton pattern considered an anti-pattern in some contexts?**

**A:** Singletons create tight coupling (hard to test and mock), hidden dependencies (not visible in constructors), shared mutable state (thread safety issues), and violate Single Responsibility Principle (class manages its own lifecycle). In Spring, DI solves these: beans ARE singletons but created/managed by the IoC container. You inject them explicitly (visible dependencies) and can substitute mock beans for testing.

---

> 🎯 **Session 16 Summary:** You've mastered the most important design patterns for backend development: Singleton (shared resources), Factory (object creation), Builder (complex construction), Observer (event-driven), Strategy (interchangeable algorithms), Decorator (add behavior without modification), and DTO/Mapper (API data transfer). These patterns make your code flexible, testable, and maintainable!
