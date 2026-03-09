# Session 9: Spring Core — Dependency Injection & IoC Container

---

## Table of Contents

1. [Understanding IoC and Dependency Injection](#understanding-ioc-and-dependency-injection)
2. [The Spring IoC Container](#the-spring-ioc-container)
3. [Bean Lifecycle — From Birth to Death](#bean-lifecycle)
4. [Types of Dependency Injection](#types-of-dependency-injection)
5. [Bean Scopes](#bean-scopes)
6. [Stereotype Annotations](#stereotype-annotations)
7. [Profiles and External Configuration](#profiles-and-external-configuration)
8. [Introduction to AOP](#introduction-to-aop)
9. [Complete Project: Notification System with DI](#complete-project-notification-system)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Understanding IoC and Dependency Injection

> 🎭 **Story: The Puppet And The Puppet Master**
> 
> **Without IoC (Traditional Code):**
> Imagine you're a puppet who builds your own strings, connects them to your own hands, AND performs the show. You control everything — exhausting!
> 
> ```java
> class Puppet {
>     // Puppet creates its OWN dependencies
>     private Stage stage = new Stage();           // Builds the stage
>     private Music music = new LiveOrchestra();   // Hires the orchestra
>     private Lighting light = new SpotLight();    // Sets up lights
> }
> ```
> 
> **With IoC (Inversion of Control):**
> A **Puppet Master** (Spring Container) builds the strings, connects them, and hands you a fully wired puppet. You just perform! The **control is inverted** — you don't create dependencies; someone GIVES them to you.
> 
> ```java
> class Puppet {
>     // Puppet RECEIVES its dependencies (injected by Spring)
>     private final Stage stage;
>     private final Music music;
> 
>     Puppet(Stage stage, Music music) { // Spring provides these!
>         this.stage = stage;
>         this.music = music;
>     }
> }
> ```

### Why Does This Matter?

```java
// ===== WITHOUT DI — Tight Coupling (BAD) =====
class OrderService {
    // OrderService is MARRIED to MySQLDatabase — can't change without modifying code
    private MySQLDatabase database = new MySQLDatabase();
    private SmtpEmailService emailService = new SmtpEmailService();

    // If we switch to PostgreSQL or use a mock for testing, 
    // we must CHANGE this class. Violates Open-Closed Principle!
}

// ===== WITH DI — Loose Coupling (GOOD) =====
class OrderService {
    private final Database database;         // Interface!
    private final EmailService emailService; // Interface!

    // Spring injects the concrete implementations
    OrderService(Database database, EmailService emailService) {
        this.database = database;
        this.emailService = emailService;
    }
    // Now we can swap MySQL → PostgreSQL, or use a MockDatabase for testing
    // WITHOUT changing OrderService at all!
}
```

**Key Benefits:**

1. **Testability** — inject mocks for unit testing
2. **Flexibility** — swap implementations without code changes
3. **Single Responsibility** — class doesn't create its dependencies
4. **Loose Coupling** — depends on interfaces, not concrete classes

---

## The Spring IoC Container

> 🏭 **Story: The Factory Manager**
> 
> Spring's IoC Container is like a **factory manager** who:
> 
> 1. Reads the **blueprints** (configuration — annotations, XML, Java config)
> 2. **Creates objects** (beans) based on the blueprints
> 3. **Wires them together** (injects dependencies)
> 4. **Manages their lifecycle** (initializes, uses, destroys)
> 
> There are two types of containers:
> 
> - `BeanFactory` — basic, lazy-loads beans (creates them only when requested)
> - `ApplicationContext` — advanced, eager-loads singletons, supports AOP/events/i18n

```java
// File: IoCContainerDemo.java
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.*;

// Step 1: Define beans
interface GreetingService {
    String greet(String name);
}

@Component // Tells Spring: "Create a bean of this class"
class EnglishGreeting implements GreetingService {
    @Override
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}

@Component
class HindiGreeting implements GreetingService {
    @Override
    public String greet(String name) {
        return "Namaste, " + name + "!";
    }
}

// Step 2: Inject and use
@Component
class GreetingController {
    private final GreetingService greetingService;

    // Spring sees TWO GreetingService beans — ambiguity!
    // Solution: use @Qualifier to specify which one
    public GreetingController(@Qualifier("englishGreeting") GreetingService greetingService) {
        this.greetingService = greetingService;
    }

    public void sayHello(String name) {
        System.out.println(greetingService.greet(name));
    }
}

// Step 3: Java Configuration (alternative to @Component scanning)
@Configuration
class AppConfig {

    @Bean
    public GreetingService frenchGreeting() {
        return name -> "Bonjour, " + name + "!";
    }

    @Bean
    @Primary // This becomes the default when type is ambiguous
    public GreetingService defaultGreeting() {
        return name -> "Hey, " + name + "! 👋";
    }
}
```

**@Component vs @Bean:**

| Feature      | `@Component`                       | `@Bean`                                |
| ------------ | ---------------------------------- | -------------------------------------- |
| **Where**    | On a class                         | On a method in `@Configuration`        |
| **How**      | Auto-detected via `@ComponentScan` | Explicitly declared                    |
| **Control**  | Spring creates the instance        | YOU create the instance                |
| **Use case** | Your own classes                   | 3rd party libraries you can't annotate |

---

## Bean Lifecycle — From Birth to Death

```
┌─────────────────────────────────────────────────────────────┐
│                    Bean Lifecycle                             │
│                                                              │
│  1. Container Starts                                         │
│  2. Bean Definition Read (from annotations/XML/Java config)  │
│  3. Bean Instantiated (constructor called)                   │
│  4. Dependencies Injected                                    │
│  5. @PostConstruct method called                             │
│  6. Bean Ready for Use                                       │
│  7. Container Shutting Down                                  │
│  8. @PreDestroy method called                                │
│  9. Bean Destroyed                                           │
└─────────────────────────────────────────────────────────────┘
```

```java
// File: BeanLifecycleDemo.java
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionPool {

    private List<String> connections;

    // Step 1: Constructor
    public DatabaseConnectionPool() {
        System.out.println("1️⃣ Constructor called — Bean instantiated");
    }

    // Step 2: After dependencies are injected
    @PostConstruct
    public void init() {
        System.out.println("2️⃣ @PostConstruct — Initializing connection pool");
        connections = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            connections.add("Connection-" + (i + 1));
        }
        System.out.println("   Pool created with " + connections.size() + " connections");
    }

    // Step 3: Bean is used
    public String getConnection() {
        String conn = connections.remove(0);
        System.out.println("3️⃣ Using: " + conn);
        return conn;
    }

    // Step 4: Before container shuts down
    @PreDestroy
    public void destroy() {
        System.out.println("4️⃣ @PreDestroy — Closing all connections");
        connections.clear();
        System.out.println("   All connections closed");
    }
}
```

---

## Types of Dependency Injection

### 1. Constructor Injection (✅ Recommended)

```java
@Service
public class OrderService {
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    // If there's ONLY ONE constructor, @Autowired is optional!
    public OrderService(PaymentService paymentService,
                       InventoryService inventoryService,
                       NotificationService notificationService) {
        this.paymentService = paymentService;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }
}
```

**Why constructor injection is best:**

- Fields can be `final` → immutable, thread-safe
- All dependencies are required (fails fast at startup if missing)
- Easy to unit test — just pass mocks in the constructor
- Clear contract — constructor shows ALL dependencies

### 2. Setter Injection (Optional dependencies)

```java
@Service
public class ReportService {
    private EmailService emailService;

    @Autowired(required = false) // Optional — bean might not exist
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

### 3. Field Injection (❌ Avoid in production)

```java
@Service
public class UserService {
    @Autowired // Works, but not recommended
    private UserRepository userRepository;

    // Problems:
    // 1. Can't be final
    // 2. Hard to test (need reflection to set field)
    // 3. Hides dependencies (class looks like it has none)
}
```

---

## Bean Scopes

```java
// File: BeanScopeDemo.java
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

// ===== SINGLETON (Default) — One instance for entire app =====
@Component
@Scope("singleton") // This is the default — can be omitted
public class ConfigManager {
    // Only ONE instance created. Shared by ALL who inject it.
    // Created at startup.
}

// ===== PROTOTYPE — New instance every time =====
@Component
@Scope("prototype")
public class ShoppingCart {
    // NEW instance every time someone injects or requests it.
    // Spring does NOT manage its full lifecycle (no @PreDestroy).
}

// ===== REQUEST (Web only) — One per HTTP request =====
@Component
@Scope("request")
public class RequestLogger {
    // New instance for EACH HTTP request. Dies when request ends.
}

// ===== SESSION (Web only) — One per user session =====
@Component  
@Scope("session")
public class UserSession {
    // One instance per browser session. Dies when session expires.
}
```

| Scope       | Instances          | Lifecycle          | Use Case                 |
| ----------- | ------------------ | ------------------ | ------------------------ |
| `singleton` | 1 per container    | Container lifetime | Services, repos, configs |
| `prototype` | New each time      | Not managed        | Shopping carts, builders |
| `request`   | 1 per HTTP request | Request lifetime   | Request-specific data    |
| `session`   | 1 per user session | Session lifetime   | User-specific state      |

---

## Stereotype Annotations

```
@Component — Generic Spring-managed bean (base annotation)
    ├── @Service       — Business logic layer
    ├── @Repository    — Data access layer (also translates DB exceptions)
    ├── @Controller    — Web MVC controller (returns views)
    └── @RestController — REST API controller (returns JSON)

@Configuration — Declares @Bean factory methods
```

```java
@Repository // Marks as data access layer — also enables exception translation
public class UserRepository {
    public User findById(Long id) { /* DB query */ }
}

@Service // Marks as business logic layer
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User getUser(Long id) {
        return repository.findById(id);
    }
}

@RestController // Marks as API endpoint layer
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return service.getUser(id);
    }
}
```

**Layered Architecture:**

```
Client Request → Controller → Service → Repository → Database
                 (Web Layer)  (Logic)   (Data Access)
```

---

## Profiles and External Configuration

> 🎭 **Story: The Theater Set Changes**
> 
> A theater company performs the same play in different cities. The script (code) stays the same, but the **set design** changes — small stage in Mumbai, large in Delhi, outdoor in Goa. Spring **Profiles** work the same way — same application, different configurations for dev/staging/production.

```java
// File: DataSourceConfig.java
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev") // Active only in "dev" profile
    public DataSource devDataSource() {
        // H2 in-memory database
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .build();
    }

    @Bean
    @Profile("prod") // Active only in "prod" profile
    public DataSource prodDataSource() {
        // Real MySQL database
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://prod-server:3306/mydb");
        ds.setUsername("admin");
        ds.setPassword("secret");
        return ds;
    }
}
```

**application.properties (default):**

```properties
app.name=MyApp
server.port=8080
```

**application-dev.properties:**

```properties
spring.datasource.url=jdbc:h2:mem:devdb
spring.jpa.show-sql=true
logging.level.root=DEBUG
```

**application-prod.properties:**

```properties
spring.datasource.url=jdbc:mysql://prod-db:3306/mydb
spring.jpa.show-sql=false
logging.level.root=WARN
```

**Activating profiles:**

```bash
# In application.properties
spring.profiles.active=dev

# Command line
java -jar myapp.jar --spring.profiles.active=prod

# Environment variable
export SPRING_PROFILES_ACTIVE=prod
```

### @Value — Injecting External Configuration

```java
@Component
public class AppConfig {
    @Value("${app.name}")
    private String appName;

    @Value("${server.port:8080}") // Default value if not set
    private int port;

    @Value("${app.feature.enabled:false}")
    private boolean featureEnabled;
}
```

---

## Introduction to AOP

> 🎥 **Story: The Security Camera System**
> 
> In a building, every room has its own purpose — meeting room, server room, cafeteria. But ALL rooms need **security cameras** and **door access logs**. Instead of installing a custom security system in each room (modifying each class), you install a CENTRAL system that automatically monitors ALL rooms (cross-cutting concerns).
> 
> **AOP** lets you add behavior (logging, security, transactions) to methods WITHOUT modifying the methods themselves.

```java
// File: LoggingAspect.java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    // @Before — runs BEFORE the target method
    @Before("execution(* com.abhishek.service.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("➡️ Calling: " + joinPoint.getSignature().getName());
    }

    // @After — runs AFTER the target method (always, even on exception)
    @After("execution(* com.abhishek.service.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("⬅️ Finished: " + joinPoint.getSignature().getName());
    }

    // @Around — wraps the method (most powerful)
    @Around("execution(* com.abhishek.service.*.*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed(); // Execute the actual method

        long elapsed = System.currentTimeMillis() - start;
        System.out.println("⏱️ " + joinPoint.getSignature().getName() + 
                         " took " + elapsed + "ms");
        return result;
    }
}
```

**AOP Terminology:**

- **Aspect** — A module of cross-cutting concern (logging, security)
- **Join Point** — A point during execution (method call, field access)
- **Advice** — Action taken at a join point (`@Before`, `@After`, `@Around`)
- **Pointcut** — Expression that matches join points (`execution(* com.abhishek.service.*.*(..))`)

---

## Complete Project: Notification System with DI

```java
// File: NotificationService.java — Interface
package com.abhishek.notification;

public interface NotificationService {
    void send(String to, String message);
    String getType();
}

// File: EmailNotification.java
@Component
public class EmailNotification implements NotificationService {
    @Override
    public void send(String to, String message) {
        System.out.println("📧 Email to " + to + ": " + message);
    }

    @Override
    public String getType() { return "EMAIL"; }
}

// File: SmsNotification.java
@Component
public class SmsNotification implements NotificationService {
    @Override
    public void send(String to, String message) {
        System.out.println("📱 SMS to " + to + ": " + message);
    }

    @Override
    public String getType() { return "SMS"; }
}

// File: PushNotification.java
@Component
public class PushNotification implements NotificationService {
    @Override
    public void send(String to, String message) {
        System.out.println("🔔 Push to " + to + ": " + message);
    }

    @Override
    public String getType() { return "PUSH"; }
}

// File: NotificationManager.java — Injects ALL implementations
@Service
public class NotificationManager {

    // Spring injects ALL beans of type NotificationService
    private final List<NotificationService> notificationServices;

    public NotificationManager(List<NotificationService> notificationServices) {
        this.notificationServices = notificationServices;
        System.out.println("Loaded " + notificationServices.size() + " notification channels:");
        notificationServices.forEach(n -> System.out.println("  ✅ " + n.getType()));
    }

    // Send via ALL channels
    public void broadcast(String to, String message) {
        notificationServices.forEach(service -> service.send(to, message));
    }

    // Send via specific channel
    public void sendVia(String type, String to, String message) {
        notificationServices.stream()
            .filter(s -> s.getType().equalsIgnoreCase(type))
            .findFirst()
            .ifPresent(s -> s.send(to, message));
    }
}

// File: NotificationController.java
@RestController
@RequestMapping("/api/notify")
public class NotificationController {

    private final NotificationManager manager;

    public NotificationController(NotificationManager manager) {
        this.manager = manager;
    }

    @PostMapping("/broadcast")
    public Map<String, String> broadcast(@RequestParam String to, @RequestParam String message) {
        manager.broadcast(to, message);
        return Map.of("status", "Sent via all channels", "to", to);
    }

    @PostMapping("/send")
    public Map<String, String> send(@RequestParam String type, 
                                      @RequestParam String to, 
                                      @RequestParam String message) {
        manager.sendVia(type, to, message);
        return Map.of("status", "Sent via " + type, "to", to);
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between IoC and Dependency Injection?**

**A:** **IoC (Inversion of Control)** is a broad design PRINCIPLE where the control of object creation and lifecycle is transferred from the application code to a framework/container. **Dependency Injection** is a specific PATTERN/technique to achieve IoC — the container injects dependencies into objects instead of objects creating their own.

IoC is the "what," DI is the "how."

---

**Q2: What is the difference between `@Autowired` by type vs `@Qualifier`?**

**A:** By default, `@Autowired` resolves beans **by type**. If there are multiple beans of the same type, it tries the **field name** as a qualifier. If that still doesn't resolve, it throws `NoUniqueBeanDefinitionException`.

`@Qualifier("beanName")` explicitly specifies WHICH bean to inject. `@Primary` marks a default when there are multiple candidates.

```java
// Two beans of type NotificationService
@Autowired
@Qualifier("smsNotification") // Explicitly picks the SMS one
private NotificationService service;
```

---

### Medium-Hard Questions

**Q3: What happens if a Singleton bean depends on a Prototype bean?**

**A:** The prototype bean is injected ONCE when the singleton is created and never changes — effectively becoming a singleton! This is a common pitfall.

**Solutions:**

1. **`ObjectProvider<T>`** or **`Provider<T>`** — inject the factory, call `getObject()` each time
2. **`@Lookup`** method — Spring overrides it to return a fresh prototype
3. **`ApplicationContext.getBean()`** — manually get from container (not recommended — service locator anti-pattern)

```java
@Component
public class SingletonService {
    private final ObjectProvider<PrototypeBean> provider;

    public SingletonService(ObjectProvider<PrototypeBean> provider) {
        this.provider = provider;
    }

    public void doWork() {
        PrototypeBean fresh = provider.getObject(); // New instance each time!
    }
}
```

---

**Q4: Explain the difference between `BeanFactory` and `ApplicationContext`.**

**A:**

| Feature              | BeanFactory                 | ApplicationContext     |
| -------------------- | --------------------------- | ---------------------- |
| Bean loading         | **Lazy** (on first request) | **Eager** (at startup) |
| AOP support          | ❌ Limited                   | ✅ Full                 |
| Event publishing     | ❌ No                        | ✅ Yes                  |
| Internationalization | ❌ No                        | ✅ Yes                  |
| Environment/Profiles | ❌ No                        | ✅ Yes                  |

`ApplicationContext` EXTENDS `BeanFactory` — it's a superset. In modern Spring, you almost always use `ApplicationContext`. `BeanFactory` is only relevant in extremely memory-constrained environments.

---

**Q5: How does Spring resolve circular dependencies?**

**A:** A circular dependency: A depends on B, B depends on A. Spring handles this for **setter/field injection** by creating a partially initialized bean (a proxy) and injecting it. But for **constructor injection**, it CANNOT be resolved — Spring throws `BeanCurrentlyInCreationException` because both constructors need the other bean.

Solutions:

1. Redesign — circular dependencies are usually a design smell
2. Use `@Lazy` on one of the injections — Spring injects a proxy that resolves lazily
3. Move shared logic to a third class that both depend on

---

> 🎯 **Session 9 Summary:** You've mastered IoC and DI (the core Spring philosophy), the IoC container lifecycle, constructor/setter/field injection, bean scopes (singleton, prototype, request, session), stereotype annotations, Spring Profiles for environment-specific config, and AOP for cross-cutting concerns. These concepts are the foundation that ALL of Spring Framework builds upon!
