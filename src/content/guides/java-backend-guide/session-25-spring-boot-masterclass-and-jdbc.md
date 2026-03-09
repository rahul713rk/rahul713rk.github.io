---
title: "Session 25: Spring Boot Masterclass & JDBC"
description: "Step 21 of Java Backend Guide: Session 25: Spring Boot Masterclass & JDBC."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 21
---

---

## Table of Contents

1. [Introduction to JDBC](#introduction-to-jdbc)
2. [The "Old Way": Plain JDBC](#the-old-way-plain-jdbc)
3. [The "Spring Way": JdbcTemplate](#the-spring-way-jdbctemplate)
4. [JDBC vs JPA: When to use what?](#jdbc-vs-jpa)
5. [Global Exception Handling](#global-exception-handling)
6. [Advanced Validation & Custom Constraints](#advanced-validation)
7. [Asynchronous Processing (@Async)](#asynchronous-processing)
8. [Task Scheduling (@Scheduled)](#task-scheduling)
9. [Externalized Configuration (@ConfigurationProperties)](#externalized-configuration)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Introduction to JDBC

> 🔌 **Story: The Universal Power Adapter**
> 
> Every database (MySQL, PostgreSQL, Oracle) speaks a slightly different language. If your Java app had to learn every language, it would be a mess. **JDBC (Java Database Connectivity)** is like a universal power adapter. You plug your Java app into the JDBC interface, and the **Database Driver** handles the specific language of the database.

**Core Components:**

* **Driver:** The bridge between Java and the specific DB.
* **Connection:** The session between Java and the DB.
* **Statement:** The SQL command container.
* **ResultSet:** The table of data returned from the DB.

---

## The "Old Way": Plain JDBC

Before Spring, we had to handle connections, statements, and result sets manually. It involved a lot of "Boilerplate code" (repetitive code).

```java
// DON'T DO THIS in modern apps, but good to know for interviews!
public List<User> getAllUsers() {
    List<User> users = new ArrayList<>();
    String sql = "SELECT id, name, email FROM users";

    // Try-with-resources handles closing connection automatically
    try (Connection conn = DriverManager.getConnection(url, user, pass);
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            User u = new User();
            u.setId(rs.getLong("id"));
            u.setName(rs.getString("name"));
            u.setEmail(rs.getString("email"));
            users.add(u);
        }
    } catch (SQLException e) {
        e.printStackTrace(); // Bad: hard to debug in production
    }
    return users;
}
```

---

## The "Spring Way": JdbcTemplate

Spring's `JdbcTemplate` removes the boilerplate (opening/closing connections) and handles exceptions for you.

```java
@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // RowMapper tells Spring how to convert a DB row into a Java object
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        return user;
    };

    public List<User> findAll() {
        return jdbcTemplate.query("SELECT * FROM users", userRowMapper);
    }

    public User findById(Long id) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?", 
            userRowMapper, 
            id
        );
    }

    public int save(User user) {
        return jdbcTemplate.update(
            "INSERT INTO users (name, email) VALUES (?, ?)", 
            user.getName(), user.getEmail()
        );
    }
}
```

---

## JDBC vs JPA: When to use what?

| Feature         | JDBC / JdbcTemplate                | JPA / Hibernate              |
| --------------- | ---------------------------------- | ---------------------------- |
| **Control**     | Full control over SQL              | Automated SQL generation     |
| **Complexity**  | High (manual mapping)              | Low (annotation based)       |
| **Performance** | Fastest for bulk/complex queries   | Slower due to overhead       |
| **Type Safe**   | Low                                | High                         |
| **Use Case**    | Reports, Batch Inserts, Legacy DBs | Standard CRUD, Relationships |

---

## Global Exception Handling

> 🚑 **Story: The ER Triage**
> 
> When a patient arrives at the hospital, they don't find a doctor themselves (try-catch in every method). They go to **Triage** (Global Exception Handler), which checks their symptoms and sends them to the right specialist with a standard form.

```java
// 1. Create a standard Error Response DTO
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String message,
    String path,
    Map<String, String> errors // For validation errors
) {}

// 2. The Global Handler
@RestControllerAdvice // Intercepts exceptions from ALL controllers
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(UserNotFoundException ex, WebRequest request) {
        ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            request.getDescription(false),
            null
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Handle Validation Errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> 
            errors.put(e.getField(), e.getDefaultMessage())
        );

        ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Validation Failed",
            request.getDescription(false),
            errors
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
```

---

## Advanced Validation & Custom Constraints

Sometimes `@NotBlank` or `@Email` isn't enough. You might need to check if a "Username is already taken" or if a "Password is strong enough."

```java
// 1. Create the Annotation
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
public @interface StrongPassword {
    String message() default "Password must have 8 chars, 1 digit, 1 uppercase";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 2. Create the Validator Logic
public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return value.length() >= 8 && value.matches(".*\\d.*") && value.matches(".*[A-Z].*");
    }
}

// 3. Use it in DTO
public class RegisterRequest {
    @NotBlank
    private String username;

    @StrongPassword
    private String password;
}
```

---

## Asynchronous Processing (@Async)

> ☕ **Story: The Coffee Shop**
> 
> You order a coffee (Request). Instead of making you stand at the counter while they brew it (Blocking), they give you a buzzer and you go sit down (Non-blocking). When the coffee is ready, the buzzer goes off (Callback/Async).

```java
@Configuration
@EnableAsync // Step 1: Enable it
public class AsyncConfig {}

@Service
@Slf4j
public class EmailService {

    @Async // Step 2: Mark method as Async
    public void sendEmail(String to, String body) {
        log.info("📧 Sending email to {}...", to);
        try {
            Thread.sleep(5000); // Simulate slow network
        } catch (InterruptedException e) {}
        log.info("✅ Email sent!");
    }
}

// In Controller
@PostMapping("/register")
public String register(@RequestBody User user) {
    userService.save(user);
    emailService.sendEmail(user.getEmail(), "Welcome!"); // Returns INSTANTLY
    return "User registered, email will arrive shortly.";
}
```

---

## Task Scheduling (@Scheduled)

```java
@Configuration
@EnableScheduling // Step 1
public class SchedulerConfig {}

@Component
@Slf4j
public class ReportGenerator {

    // Fixed Rate: Runs every 1 hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupLogs() {
        log.info("🧹 Cleaning up old logs...");
    }

    // Cron Expression: Runs every day at midnight
    // Second Minute Hour Day Month DayOfWeek
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyReport() {
        log.info("📊 Generating daily business report...");
    }
}
```

---

## Externalized Configuration (@ConfigurationProperties)

Instead of using `@Value("${my.prop}")` everywhere, group your settings into an object.

```yaml
# application.yml
app:
  security:
    jwt-secret: my-super-secret-key-123
    token-expiry-minutes: 60
  mail:
    host: smtp.gmail.com
    port: 587
```

```java
@Configuration
@ConfigurationProperties(prefix = "app") // Step 1: Mapping
@Data // Step 2: Needs getters/setters
public class AppConfig {

    private final Security security = new Security();
    private final Mail mail = new Mail();

    @Data
    public static class Security {
        private String jwtSecret;
        private int tokenExpiryMinutes;
    }

    @Data
    public static class Mail {
        private String host;
        private int port;
    }
}

// Usage: Inject AppConfig instead of raw @Value
@Service
public class AuthService {
    private final AppConfig appConfig;

    public void printConfig() {
        System.out.println(appConfig.getSecurity().getJwtSecret());
    }
}
```

---

## Interview Questions & Answers

### Conceptual

**Q1: What is the difference between `PreparedStatement` and `Statement` in JDBC?**

**A:** `PreparedStatement` is pre-compiled by the database, making it faster for repeated queries. More importantly, it prevents **SQL Injection** by using placeholders (`?`) to automatically escape user input. `Statement` is compiled every time and is prone to injection. **Always use PreparedStatement.**

**Q2: How does Spring handle JDBC Exceptions?**

**A:** Plain JDBC throws `SQLException`, which is a **checked exception** (forcing try-catch). Spring catches these and wraps them into a `DataAccessException` hierarchy (e.g., `DuplicateKeyException`, `DataIntegrityViolationException`), which are **unchecked exceptions**. This makes your code much cleaner.

---

### Medium-Hard

**Q3: When would you choose `JdbcTemplate` over Spring Data JPA?**

**A:**

1. **Bulk Operations:** Hibernate can be slow when inserting millions of rows because it tracks every object in its "Persistence Context."
2. **Complex Reports:** SQL queries with 10+ joins and complex aggregations are often easier to write and tune in pure SQL than in JPQL/Criteria API.
3. **Legacy Databases:** If the DB schema doesn't follow standard ORM patterns (e.g., no primary keys, weird table relationships).

**Q4: Explain `@ControllerAdvice` vs `@RestControllerAdvice`.**

**A:** Both are used for global exception handling. `@ControllerAdvice` requires you to use `@ResponseBody` on exception handler methods if you want to return JSON. `@RestControllerAdvice` is a shortcut that includes `@ResponseBody` automatically—it's the standard for REST APIs.

---

> 🎯 **Session 25 Summary:** You've reached the "Masterclass" level! You now understand low-level database access (JDBC), production-grade error handling (Global Exceptions), clean configuration (@ConfigurationProperties), and background automation (Async/Scheduling). Your Spring Boot toolkit is 100% complete! 🚀
