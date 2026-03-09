---
title: "Session 2: Advanced Java Concepts"
description: "Step 2 of Java Backend Guide: Session 2: Advanced Java Concepts."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 2
---

---

## Table of Contents

1. [Abstract Classes vs Interfaces](#abstract-classes-vs-interfaces)
2. [Java Exception Hierarchy](#java-exception-hierarchy)
3. [The `finally` Block and `throw` Keyword](#the-finally-block-and-throw-keyword)
4. [Exception Propagation](#exception-propagation)
5. [Custom Exceptions](#custom-exceptions)
6. [Singleton Design Pattern](#singleton-design-pattern)
7. [Complete Project: Online Order Processing System](#complete-project-online-order-processing-system)
8. [Interview Questions & Answers](#interview-questions--answers)

---

## Abstract Classes vs Interfaces

> 🎭 **Story: The Theater Contract**
> 
> Imagine a theater company. The **director** (abstract class) gives actors a **partial script** — some scenes are fully written (concrete methods), some just say "improvise here" (abstract methods). Every actor who joins MUST follow the written scenes and fill in the improvisation.
> 
> Now there's also a **talent agency** (interface) that says: "If you want to be listed with us, you MUST be able to sing, dance, and act." They don't teach you HOW — they just define WHAT you must be able to do. An actor can only belong to ONE theater company (single inheritance) but can register with MULTIPLE talent agencies (implement multiple interfaces).

### The Key Differences

| Feature              | Abstract Class                        | Interface                             |
| -------------------- | ------------------------------------- | ------------------------------------- |
| **Keyword**          | `abstract class`                      | `interface`                           |
| **Methods**          | Abstract + Concrete                   | Abstract + Default + Static (Java 8+) |
| **Fields**           | Any type                              | Only `public static final`            |
| **Constructor**      | Yes                                   | No                                    |
| **Multiple**         | Extends only ONE                      | Implements MANY                       |
| **Access modifiers** | Any                                   | `public` by default                   |
| **When to use**      | "IS-A" relationship with shared state | "CAN-DO" capabilities/contracts       |

### Code Example: Building a Payment System

```java
// File: PaymentSystem.java

// ========= INTERFACE: Defines capabilities (CAN-DO) =========
interface Refundable {
    boolean processRefund(double amount);

    // Java 8: Default method — optional implementation
    default String getRefundPolicy() {
        return "Refund within 30 days of purchase";
    }
}

interface Trackable {
    String getTrackingId();
    void updateStatus(String status);
}

// ========= ABSTRACT CLASS: Defines a family (IS-A) =========
abstract class Payment {
    protected String paymentId;
    protected double amount;
    protected String currency;
    protected String status;

    // Abstract class CAN have constructors
    public Payment(String paymentId, double amount, String currency) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.currency = currency;
        this.status = "INITIATED";
    }

    // Abstract method — subclass MUST implement
    abstract boolean executePayment();

    // Concrete method — shared behavior
    public void printStatus() {
        System.out.println("[" + paymentId + "] ₹" + amount + " " + currency + " — " + status);
    }
}

// ========= CONCRETE CLASS: Extends ONE class, Implements MANY interfaces =========
class CreditCardPayment extends Payment implements Refundable, Trackable {
    private String cardNumber;
    private String trackingId;

    public CreditCardPayment(String paymentId, double amount, String cardNumber) {
        super(paymentId, amount, "INR"); // Calling abstract class constructor
        this.cardNumber = cardNumber;
        this.trackingId = "TRACK-CC-" + System.currentTimeMillis();
    }

    @Override
    boolean executePayment() {
        System.out.println("💳 Processing credit card ending in " + 
                         cardNumber.substring(cardNumber.length() - 4));
        this.status = "SUCCESS";
        return true;
    }

    // Implementing Refundable interface
    @Override
    public boolean processRefund(double amount) {
        if (amount > this.amount) {
            System.out.println("❌ Refund amount exceeds original payment!");
            return false;
        }
        System.out.println("↩️ Refund of ₹" + amount + " processed to card");
        this.status = "PARTIALLY_REFUNDED";
        return true;
    }

    // Implementing Trackable interface
    @Override
    public String getTrackingId() {
        return trackingId;
    }

    @Override
    public void updateStatus(String status) {
        this.status = status;
        System.out.println("📊 Status updated to: " + status);
    }
}

class UPIPayment extends Payment implements Trackable {
    // NOTE: UPIPayment does NOT implement Refundable — UPI refunds have different rules
    private String upiId;
    private String trackingId;

    public UPIPayment(String paymentId, double amount, String upiId) {
        super(paymentId, amount, "INR");
        this.upiId = upiId;
        this.trackingId = "TRACK-UPI-" + System.currentTimeMillis();
    }

    @Override
    boolean executePayment() {
        System.out.println("📲 UPI payment via " + upiId);
        this.status = "SUCCESS";
        return true;
    }

    @Override
    public String getTrackingId() { return trackingId; }

    @Override
    public void updateStatus(String status) {
        this.status = status;
    }
}

public class PaymentSystem {
    public static void main(String[] args) {
        CreditCardPayment cc = new CreditCardPayment("PAY-001", 5000, "4111222233334444");
        UPIPayment upi = new UPIPayment("PAY-002", 1500, "user@paytm");

        cc.executePayment();
        cc.printStatus();
        System.out.println("Tracking: " + cc.getTrackingId());
        System.out.println("Refund Policy: " + cc.getRefundPolicy()); // Default method!
        cc.processRefund(1000);
        cc.printStatus();

        System.out.println();

        upi.executePayment();
        upi.printStatus();
        System.out.println("Tracking: " + upi.getTrackingId());
        // upi.processRefund(500); // COMPILE ERROR — UPIPayment doesn't implement Refundable
    }
}
```

**When to Use Which?**

- Use an **abstract class** when classes share common state (fields) and behavior. Example: all `Payment` types have an `amount`, `status`, and `printStatus()` method.
- Use an **interface** when you want to define capabilities that different class families can adopt. Example: `Refundable` can be applied to payments, orders, subscriptions — unrelated classes.

---

## Java Exception Hierarchy

> 🏥 **Story: The Hospital Emergency Room**
> 
> Think of exceptions like patients arriving at a hospital emergency room.
> 
> - **`Throwable`** is the hospital itself — the root of everything.
> - **`Error`** patients are in critical condition — power failure, earthquake, building collapse. Doctors (programmers) usually **cannot** handle these. Example: `OutOfMemoryError`, `StackOverflowError`.
> - **`Exception`** patients can be treated. They're divided into:
>   - **Checked Exceptions** (appointments) — the hospital KNOWS they're coming. The system won't compile unless you have a plan for them. Example: `IOException`, `SQLException`.
>   - **Unchecked Exceptions (RuntimeExceptions)** — walk-in emergencies. They happen unexpectedly due to programming mistakes. Example: `NullPointerException`, `ArrayIndexOutOfBoundsException`.

```
                        Throwable
                       /         \
                    Error       Exception
                   /    \        /        \
        OutOfMemory  StackOverflow  IOException  RuntimeException
        Error        Error          SQLException     /      |       \
                                    (Checked)   NullPointer  ClassCast  ArrayIndex
                                                (Unchecked)  (Unchecked) (Unchecked)
```

### Checked vs Unchecked Exceptions

```java
// File: ExceptionTypesDemo.java
import java.io.*;

public class ExceptionTypesDemo {

    // ========= CHECKED EXCEPTION =========
    // Compiler FORCES you to handle this — you can't ignore it
    public static String readFile(String path) throws IOException {
        // If this file doesn't exist, IOException is thrown
        BufferedReader reader = new BufferedReader(new FileReader(path));
        String content = reader.readLine();
        reader.close();
        return content;
    }

    // ========= UNCHECKED EXCEPTION =========
    // Compiler does NOT force you to handle this — it happens at runtime
    public static int divide(int a, int b) {
        return a / b; // ArithmeticException if b == 0, but no compile error!
    }

    public static void main(String[] args) {
        // Handling Checked Exception — MUST use try-catch or throws
        try {
            String content = readFile("nonexistent.txt");
            System.out.println(content);
        } catch (IOException e) {
            System.out.println("📁 File error: " + e.getMessage());
        }

        // Handling Unchecked Exception — optional but recommended
        try {
            int result = divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("🔢 Math error: " + e.getMessage());
        }
    }
}
```

---

## The `finally` Block and `throw` Keyword

> 🏨 **Story: The Hotel Checkout**
> 
> When you stay at a hotel, no matter what happens — whether your trip was amazing or a disaster (exception) — you ALWAYS have to check out and return the room key. The `finally` block is like that hotel checkout: **it ALWAYS runs**, regardless of whether an exception occurred.
> 
> The `throw` keyword is like calling the **fire alarm** yourself. You detect a problem and explicitly RAISE an alert.

```java
// File: FinallyAndThrowDemo.java

class InsufficientFundsException extends Exception {
    private double deficit;

    public InsufficientFundsException(double deficit) {
        super("Insufficient funds! Short by ₹" + deficit);
        this.deficit = deficit;
    }

    public double getDeficit() { return deficit; }
}

class WalletService {
    private double balance;
    private boolean isLocked = false;

    public WalletService(double balance) {
        this.balance = balance;
    }

    public void transfer(double amount) throws InsufficientFundsException {
        System.out.println("\n🔄 Starting transfer of ₹" + amount);

        // Acquire lock (simulate resource acquisition)
        isLocked = true;
        System.out.println("🔒 Wallet locked for transaction");

        try {
            // Validate
            if (amount <= 0) {
                // THROW — manually raising an exception
                throw new IllegalArgumentException("Amount must be positive!");
            }

            if (amount > balance) {
                // THROW — a custom checked exception
                throw new InsufficientFundsException(amount - balance);
            }

            // Process
            balance -= amount;
            System.out.println("✅ Transfer successful! New balance: ₹" + balance);

        } catch (IllegalArgumentException e) {
            System.out.println("❌ Validation error: " + e.getMessage());

        } finally {
            // THIS ALWAYS RUNS — even after throw, return, or successful execution
            isLocked = false;
            System.out.println("🔓 Wallet unlocked (finally block executed)");
        }
    }
}

public class FinallyAndThrowDemo {
    public static void main(String[] args) {
        WalletService wallet = new WalletService(5000);

        // Success case — finally runs after success
        try {
            wallet.transfer(2000);
        } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage());
        }

        // Validation error case — finally runs after catch
        try {
            wallet.transfer(-100);
        } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage());
        }

        // Insufficient funds case — finally runs, exception propagates
        try {
            wallet.transfer(50000);
        } catch (InsufficientFundsException e) {
            System.out.println("💰 " + e.getMessage());
            System.out.println("   Deficit: ₹" + e.getDeficit());
        }
    }
}
```

**Output:**

```
🔄 Starting transfer of ₹2000.0
🔒 Wallet locked for transaction
✅ Transfer successful! New balance: ₹3000.0
🔓 Wallet unlocked (finally block executed)

🔄 Starting transfer of ₹-100.0
🔒 Wallet locked for transaction
❌ Validation error: Amount must be positive!
🔓 Wallet unlocked (finally block executed)

🔄 Starting transfer of ₹50000.0
🔒 Wallet locked for transaction
🔓 Wallet unlocked (finally block executed)
💰 Insufficient funds! Short by ₹47000.0
   Deficit: ₹47000.0
```

**Key Points:**

- `finally` always runs — use it for cleanup (closing files, releasing locks, closing DB connections)
- `throw` explicitly creates and throws an exception
- `throws` in the method signature declares what checked exceptions a method might throw

---

## Exception Propagation

> 📬 **Story: The Complaint Chain**
> 
> Imagine you're a cashier at a store and a customer complains about a defective product. You can't handle it, so you **pass it up** to the floor manager. If the floor manager can't handle it, she passes it to the store manager. If the store manager can't handle it, it goes to the CEO. If NOBODY handles it, the company shuts down (program crashes). This is **exception propagation** — exceptions travel up the call stack until someone handles them.

```java
// File: ExceptionPropagationDemo.java

public class ExceptionPropagationDemo {

    // Level 3: Where the exception ORIGINATES
    static void readFromDatabase() throws Exception {
        System.out.println("  [DB Layer] Reading from database...");
        // Simulate a DB connection failure
        throw new Exception("Database connection timeout!");
    }

    // Level 2: Doesn't handle, propagates upward
    static void getOrderDetails(int orderId) throws Exception {
        System.out.println(" [Service Layer] Getting order #" + orderId);
        readFromDatabase(); // Exception propagates from here
        System.out.println(" [Service Layer] This line NEVER executes!");
    }

    // Level 1: CATCHES the exception
    static void processRequest(int orderId) {
        System.out.println("[Controller] Processing request for order #" + orderId);
        try {
            getOrderDetails(orderId);
        } catch (Exception e) {
            System.out.println("[Controller] ❌ Caught exception: " + e.getMessage());
            System.out.println("[Controller] Sending error response to client...");
        }
    }

    public static void main(String[] args) {
        processRequest(12345);
        System.out.println("\n✅ Program continues running — exception was handled!");
    }
}
```

**Output:**

```
[Controller] Processing request for order #12345
 [Service Layer] Getting order #12345
  [DB Layer] Reading from database...
[Controller] ❌ Caught exception: Database connection timeout!
[Controller] Sending error response to client...

✅ Program continues running — exception was handled!
```

**Propagation Flow:**

```
main() → processRequest() → getOrderDetails() → readFromDatabase()
                                                      ↑ Exception thrown!
                                                      │
         Caught here! ← propagates ← propagates ← ← ←
```

**For unchecked exceptions (RuntimeException),** propagation works the same way, but you don't need `throws` declarations. The exception silently propagates up until it's caught or the program crashes.

---

## Custom Exceptions

```java
// File: CustomExceptionsDemo.java

// Checked exception (extends Exception)
class UserNotFoundException extends Exception {
    private String userId;

    public UserNotFoundException(String userId) {
        super("User not found: " + userId);
        this.userId = userId;
    }

    public String getUserId() { return userId; }
}

// Unchecked exception (extends RuntimeException)
class InvalidInputException extends RuntimeException {
    private String fieldName;
    private Object invalidValue;

    public InvalidInputException(String fieldName, Object invalidValue, String reason) {
        super("Invalid " + fieldName + ": '" + invalidValue + "' — " + reason);
        this.fieldName = fieldName;
        this.invalidValue = invalidValue;
    }
}

// Business logic exception
class InsufficientBalanceException extends Exception {
    private double currentBalance;
    private double requiredAmount;

    public InsufficientBalanceException(double current, double required) {
        super(String.format("Balance ₹%.2f is less than required ₹%.2f", current, required));
        this.currentBalance = current;
        this.requiredAmount = required;
    }

    public double getShortfall() {
        return requiredAmount - currentBalance;
    }
}

// Usage in a service class
class UserWalletService {
    private java.util.Map<String, Double> wallets = new java.util.HashMap<>();

    public UserWalletService() {
        wallets.put("USER-001", 5000.0);
        wallets.put("USER-002", 15000.0);
    }

    public void transferMoney(String fromUserId, String toUserId, double amount) 
            throws UserNotFoundException, InsufficientBalanceException {

        // Validate input (throws unchecked exception)
        if (amount <= 0) {
            throw new InvalidInputException("amount", amount, "must be positive");
        }

        // Check users exist (throws checked exception)
        if (!wallets.containsKey(fromUserId)) {
            throw new UserNotFoundException(fromUserId);
        }
        if (!wallets.containsKey(toUserId)) {
            throw new UserNotFoundException(toUserId);
        }

        // Check balance (throws checked exception)
        double fromBalance = wallets.get(fromUserId);
        if (fromBalance < amount) {
            throw new InsufficientBalanceException(fromBalance, amount);
        }

        // Process transfer
        wallets.put(fromUserId, fromBalance - amount);
        wallets.put(toUserId, wallets.get(toUserId) + amount);
        System.out.println("✅ ₹" + amount + " transferred from " + fromUserId + " to " + toUserId);
    }
}

public class CustomExceptionsDemo {
    public static void main(String[] args) {
        UserWalletService service = new UserWalletService();

        // Test 1: Successful transfer
        try {
            service.transferMoney("USER-001", "USER-002", 2000);
        } catch (UserNotFoundException | InsufficientBalanceException e) {
            System.out.println("❌ " + e.getMessage());
        }

        // Test 2: User not found
        try {
            service.transferMoney("USER-999", "USER-002", 1000);
        } catch (UserNotFoundException e) {
            System.out.println("❌ " + e.getMessage() + " (ID: " + e.getUserId() + ")");
        } catch (InsufficientBalanceException e) {
            System.out.println("❌ " + e.getMessage());
        }

        // Test 3: Insufficient balance
        try {
            service.transferMoney("USER-001", "USER-002", 50000);
        } catch (UserNotFoundException e) {
            System.out.println("❌ " + e.getMessage());
        } catch (InsufficientBalanceException e) {
            System.out.println("❌ " + e.getMessage());
            System.out.println("   Shortfall: ₹" + e.getShortfall());
        }

        // Test 4: Invalid input
        try {
            service.transferMoney("USER-001", "USER-002", -500);
        } catch (Exception e) {
            System.out.println("❌ " + e.getMessage());
        }
    }
}
```

---

## Singleton Design Pattern

> 🏛️ **Story: The President of a Country**
> 
> A country can have only ONE president at a time. No matter how many citizens (threads) want to talk to the president, they all interact with the SAME person. You can't create a new president — the existing one is always returned.
> 
> The **Singleton pattern** ensures a class has exactly ONE instance and provides a global point of access to it, just like the president.

### Various Singleton Implementations

```java
// File: SingletonDemo.java

// ========= 1. EAGER SINGLETON (simplest) =========
class AppConfig {
    // Instance created at class loading time — no lazy initialization
    private static final AppConfig INSTANCE = new AppConfig();

    private String appName;
    private String version;

    // PRIVATE constructor — no one can do 'new AppConfig()'
    private AppConfig() {
        System.out.println("📦 AppConfig initialized");
        this.appName = "EWallet";
        this.version = "2.1.0";
    }

    public static AppConfig getInstance() {
        return INSTANCE;
    }

    public String getAppName() { return appName; }
    public String getVersion() { return version; }
}

// ========= 2. LAZY SINGLETON (Thread-Unsafe — DON'T use in production) =========
class DatabaseConnection {
    private static DatabaseConnection instance;
    private String connectionUrl;

    private DatabaseConnection() {
        System.out.println("🗄️ DB Connection established");
        this.connectionUrl = "jdbc:mysql://localhost:3306/mydb";
    }

    // Problem: Two threads can both see instance == null simultaneously!
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }

    public String getUrl() { return connectionUrl; }
}

// ========= 3. THREAD-SAFE SINGLETON (Double-Checked Locking) =========
class Logger {
    // 'volatile' ensures visibility across threads
    private static volatile Logger instance;
    private java.util.List<String> logs = new java.util.ArrayList<>();

    private Logger() {
        System.out.println("📝 Logger initialized");
    }

    public static Logger getInstance() {
        if (instance == null) {               // First check (no locking)
            synchronized (Logger.class) {     // Lock only if needed
                if (instance == null) {       // Second check (with lock)
                    instance = new Logger();
                }
            }
        }
        return instance;
    }

    public void log(String message) {
        String timestamp = java.time.LocalDateTime.now().toString();
        String entry = "[" + timestamp + "] " + message;
        logs.add(entry);
        System.out.println(entry);
    }

    public void printAllLogs() {
        System.out.println("\n--- All Logs ---");
        logs.forEach(System.out::println);
    }
}

// ========= 4. BILL PUGH SINGLETON (Best practice) =========
class CacheManager {

    // Inner static class — not loaded until getInstance() is called
    private static class Holder {
        private static final CacheManager INSTANCE = new CacheManager();
    }

    private java.util.Map<String, String> cache = new java.util.HashMap<>();

    private CacheManager() {
        System.out.println("💾 CacheManager initialized");
    }

    public static CacheManager getInstance() {
        return Holder.INSTANCE; // Class loaded lazily, thread-safe by JVM
    }

    public void put(String key, String value) {
        cache.put(key, value);
    }

    public String get(String key) {
        return cache.getOrDefault(key, "NOT_FOUND");
    }
}

public class SingletonDemo {
    public static void main(String[] args) {
        // Test Eager Singleton
        AppConfig config1 = AppConfig.getInstance();
        AppConfig config2 = AppConfig.getInstance();
        System.out.println("Same instance? " + (config1 == config2)); // true
        System.out.println("App: " + config1.getAppName() + " v" + config2.getVersion());

        System.out.println();

        // Test Logger (thread-safe)
        Logger logger = Logger.getInstance();
        logger.log("Application started");
        logger.log("User logged in");
        Logger.getInstance().log("Same logger instance!"); // Same object
        logger.printAllLogs();

        System.out.println();

        // Test CacheManager (Bill Pugh)
        CacheManager cache = CacheManager.getInstance();
        cache.put("user:1:name", "Abhishek");
        cache.put("user:1:email", "abhishek@example.com");
        System.out.println("Cached name: " + cache.get("user:1:name"));
        System.out.println("Missing key: " + cache.get("nonexistent"));
    }
}
```

**Which Singleton to use?**
| Approach | Thread-Safe? | Lazy? | Best For |
|----------|-------------|-------|----------|
| Eager | ✅ | ❌ | Simple cases, always-needed instances |
| Lazy (basic) | ❌ | ✅ | Single-threaded apps only |
| Double-Checked Locking | ✅ | ✅ | When you need explicit control |
| **Bill Pugh (recommended)** | ✅ | ✅ | **Production use — best practice** |

---

## Complete Project: Online Order Processing System

```java
// File: OrderProcessingSystem.java
import java.util.*;

// Custom Exceptions
class OrderNotFoundException extends Exception {
    public OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId);
    }
}

class PaymentFailedException extends Exception {
    public PaymentFailedException(String reason) {
        super("Payment failed: " + reason);
    }
}

// Interface: Auditable
interface Auditable {
    String getAuditLog();
}

// Interface: Cancellable
interface Cancellable {
    boolean cancel(String reason);
}

// Abstract class: Order
abstract class Order implements Auditable {
    protected String orderId;
    protected String customerName;
    protected double totalAmount;
    protected String status;
    protected List<String> auditTrail = new ArrayList<>();

    public Order(String orderId, String customerName, double totalAmount) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = "CREATED";
        addAudit("Order created");
    }

    abstract void process() throws PaymentFailedException;

    protected void addAudit(String action) {
        String entry = new java.text.SimpleDateFormat("HH:mm:ss").format(new Date()) + 
                       " — " + action;
        auditTrail.add(entry);
    }

    @Override
    public String getAuditLog() {
        StringBuilder sb = new StringBuilder("Audit Log for " + orderId + ":\n");
        auditTrail.forEach(e -> sb.append("  ").append(e).append("\n"));
        return sb.toString();
    }

    public void display() {
        System.out.println("[" + orderId + "] " + customerName + " | ₹" + totalAmount + " | " + status);
    }
}

// Concrete: OnlineOrder (can be cancelled)
class OnlineOrder extends Order implements Cancellable {
    private String deliveryAddress;

    public OnlineOrder(String id, String customer, double amount, String address) {
        super(id, customer, amount);
        this.deliveryAddress = address;
    }

    @Override
    void process() throws PaymentFailedException {
        addAudit("Processing online payment...");

        // Simulate random payment failure
        if (totalAmount > 100000) {
            status = "FAILED";
            addAudit("Payment declined — amount too high");
            throw new PaymentFailedException("Amount exceeds limit of ₹100,000");
        }

        status = "PAID";
        addAudit("Payment successful");
        addAudit("Scheduled for delivery to: " + deliveryAddress);
        status = "SHIPPED";
    }

    @Override
    public boolean cancel(String reason) {
        if ("SHIPPED".equals(status) || "DELIVERED".equals(status)) {
            addAudit("Cancellation FAILED — order already " + status);
            return false;
        }
        status = "CANCELLED";
        addAudit("Cancelled: " + reason);
        return true;
    }
}

// Singleton: OrderManager
class OrderManager {
    private static volatile OrderManager instance;
    private Map<String, Order> orders = new HashMap<>();

    private OrderManager() {}

    public static OrderManager getInstance() {
        if (instance == null) {
            synchronized (OrderManager.class) {
                if (instance == null) {
                    instance = new OrderManager();
                }
            }
        }
        return instance;
    }

    public void addOrder(Order order) {
        orders.put(order.orderId, order);
    }

    public Order getOrder(String orderId) throws OrderNotFoundException {
        Order order = orders.get(orderId);
        if (order == null) throw new OrderNotFoundException(orderId);
        return order;
    }

    public void processOrder(String orderId) {
        try {
            Order order = getOrder(orderId);
            order.process();
            System.out.println("✅ Order " + orderId + " processed successfully");
        } catch (OrderNotFoundException e) {
            System.out.println("❌ " + e.getMessage());
        } catch (PaymentFailedException e) {
            System.out.println("❌ " + e.getMessage());
        } finally {
            System.out.println("📋 Transaction completed for " + orderId);
        }
    }
}

public class OrderProcessingSystem {
    public static void main(String[] args) {
        OrderManager manager = OrderManager.getInstance();

        OnlineOrder order1 = new OnlineOrder("ORD-001", "Ravi", 4500, "Mumbai");
        OnlineOrder order2 = new OnlineOrder("ORD-002", "Priya", 150000, "Delhi");
        OnlineOrder order3 = new OnlineOrder("ORD-003", "Amit", 2200, "Bangalore");

        manager.addOrder(order1);
        manager.addOrder(order2);
        manager.addOrder(order3);

        // Process orders
        manager.processOrder("ORD-001"); // Success
        manager.processOrder("ORD-002"); // Fails — too expensive
        manager.processOrder("ORD-999"); // Not found

        System.out.println();

        // Cancel an order
        if (order3.cancel("Changed my mind")) {
            System.out.println("✅ Order cancelled");
        }

        // Print audit logs
        System.out.println();
        System.out.println(order1.getAuditLog());
        System.out.println(order2.getAuditLog());
        System.out.println(order3.getAuditLog());
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: When would you use an abstract class over an interface?**

**A:** Use an abstract class when:

1. You want to share **state (fields)** among subclasses (interfaces can only have constants).
2. You need **constructors** to initialize common state.
3. You want to provide some **default method implementations** along with abstract ones.
4. The classes have strong IS-A relationships (e.g., `Dog IS-A Animal`).

Use an interface when:

1. You want to define a **contract/capability** (e.g., `Serializable`, `Comparable`).
2. A class needs to implement **multiple** contracts.
3. Unrelated classes need to share a behavior (e.g., both `Payment` and `Subscription` can be `Refundable`).

In practice, Java 8+ blurs this line since interfaces can have `default` and `static` methods. The rule of thumb: if you need shared state → abstract class. If you need a contract → interface.

---

**Q2: What's the difference between `throw` and `throws`?**

**A:**

- `throw` is used INSIDE a method body to **actually throw** an exception: `throw new IOException("file not found")`
- `throws` is used in the method SIGNATURE to **declare** which checked exceptions the method might throw: `void readFile() throws IOException`
- You `throw` a specific exception object. You `throws` exception types as a warning to callers.
- `throw` immediately transfers control to the nearest catch block. `throws` is just documentation/contract.

---

**Q3: Can we have a try block without catch?**

**A:** Yes! You can have `try-finally` without catch. This is useful when you want cleanup logic but want the exception to propagate:

```java
void processFile() throws IOException {
    FileInputStream fis = new FileInputStream("data.txt");
    try {
        // process file
    } finally {
        fis.close(); // Always cleanup, even if exception occurs
    }
}
```

Since Java 7, **try-with-resources** is preferred: `try (FileInputStream fis = new FileInputStream("data.txt")) { ... }`

---

### Medium-Hard Questions

**Q4: What happens when an exception is thrown inside a `finally` block?**

**A:** If both the `try` block and the `finally` block throw exceptions, the exception from the `finally` block **overwrites** the original exception from the `try` block. The original exception is lost!

```java
try {
    throw new RuntimeException("Original error");
} finally {
    throw new RuntimeException("Finally error"); // This overwrites the original!
}
// Only "Finally error" is propagated — "Original error" is silently lost
```

This is a devastating bug. To avoid it:

1. Never throw exceptions from `finally` blocks
2. Use try-with-resources (Java 7+) which uses **suppressed exceptions** to preserve both
3. If you must, catch the finally exception and add it as suppressed: `original.addSuppressed(finallyException)`

---

**Q5: Explain the Singleton pattern's thread-safety issue and how double-checked locking solves it.**

**A:** In a naive lazy singleton, two threads can simultaneously check `instance == null` and both see `true`, creating TWO instances — breaking the singleton guarantee.

Simple fix: `synchronized` on the whole method → works but creates a bottleneck. Every call to `getInstance()` is serialized even after the instance is created.

Double-checked locking solves this:

```java
if (instance == null) {           // 1st check — fast, no lock
    synchronized (Singleton.class) {
        if (instance == null) {   // 2nd check — with lock, prevents double creation
            instance = new Singleton();
        }
    }
}
```

But there's a subtle issue: without `volatile`, the JVM might reorder instructions during object creation. Thread A might see a partially constructed object. The `volatile` keyword prevents this by ensuring the write to `instance` happens-before any read. This is a JMM (Java Memory Model) subtlety that's often missed.

---

**Q6: What is exception chaining? When is it useful?**

**A:** Exception chaining is wrapping a low-level exception inside a higher-level exception to preserve the root cause while presenting a meaningful message:

```java
try {
    // Low-level operation
    connection.execute("SELECT * FROM users");
} catch (SQLException e) {
    // Wrap it in a business-level exception
    throw new UserServiceException("Failed to fetch users", e); // 'e' is the cause
}
```

The caller catches `UserServiceException` and can access the original cause via `getCause()`. This is essential in layered architectures:

- DAO layer throws `SQLException`
- Service layer catches it and throws `ServiceException`
- Controller layer catches `ServiceException` and returns HTTP 500
- For debugging, the full chain is preserved in logs via `printStackTrace()`

---

**Q7: What is the output of this code?**

```java
class A {
    static { System.out.println("Static A"); }
    { System.out.println("Instance A"); }
    A() { System.out.println("Constructor A"); }
}

class B extends A {
    static { System.out.println("Static B"); }
    { System.out.println("Instance B"); }
    B() { System.out.println("Constructor B"); }
}

public class Test {
    public static void main(String[] args) {
        new B();
        System.out.println("---");
        new B();
    }
}
```

**A:**

```
Static A
Static B
Instance A
Constructor A
Instance B
Constructor B
---
Instance A
Constructor A
Instance B
Constructor B
```

**Explanation:**

1. Static blocks run ONCE during class loading (parent first, then child)
2. For EACH object creation: instance initializer blocks run (parent first), then constructors (parent first)
3. Second `new B()` doesn't re-run static blocks — they've already executed

---

> 🎯 **Session 2 Summary:** You've mastered the differences between abstract classes and interfaces, understood Java's exception hierarchy (checked vs unchecked), learned to write custom exceptions, and implemented the Singleton design pattern with thread safety. These patterns form the backbone of enterprise Java applications!
