---
title: "Session 1: Java Architecture and Basics of OOPs"
description: "Step 1 of Java Backend Guide: Session 1: Java Architecture and Basics of OOPs."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 1
---

---

## Table of Contents

1. [Introduction: The City of Javaville](#introduction-the-city-of-javaville)
2. [Java Architecture](#java-architecture)
   - [How Java Code Runs: The Journey of a Letter](#how-java-code-runs-the-journey-of-a-letter)
   - [JDK, JRE, and JVM Explained](#jdk-jre-and-jvm-explained)
   - [Platform Independence: Write Once, Run Anywhere](#platform-independence-write-once-run-anywhere)
   - [JVM Memory Model](#jvm-memory-model)
3. [Basics of Object-Oriented Programming](#basics-of-object-oriented-programming)
   - [What is OOP? The Blueprint Story](#what-is-oop-the-blueprint-story)
   - [Classes and Objects](#classes-and-objects)
   - [The Four Pillars of OOP](#the-four-pillars-of-oop)
     - [Encapsulation](#1-encapsulation---the-capsule-story)
     - [Inheritance](#2-inheritance---the-family-tree)
     - [Polymorphism](#3-polymorphism---the-shape-shifter)
     - [Abstraction](#4-abstraction---the-car-dashboard)
4. [Constructors in Java](#constructors-in-java)
5. [`this` and `super` Keywords](#this-and-super-keywords)
6. [Static vs Instance Members](#static-vs-instance-members)
7. [Complete Project: Employee Management System](#complete-project-employee-management-system)
8. [Interview Questions & Answers](#interview-questions--answers)

---

## Introduction: The City of Javaville

> 🏙️ **Imagine a city called Javaville.** In this city, every building is constructed using a specific blueprint. The city has a master architect (the **JDK**), a construction crew (the **JRE**), and a magical foundation that can sit on any type of land — rocky, sandy, or clay (the **JVM**). No matter where in the world you ship a building designed in Javaville, it will stand perfectly because the foundation adapts itself to the terrain underneath. This is the magic of Java — **"Write Once, Run Anywhere."**

---

## Java Architecture

### How Java Code Runs: The Journey of a Letter

> 📬 **Story: The Journey of a Letter**
> 
> Think of writing a Java program like writing a letter in English. You write the letter (`.java` file), but the postal system doesn't understand English — it speaks a universal language called "bytecode." So your letter goes to a **translator** (the **Java Compiler — `javac`**) who converts it into this universal language (`.class` file). Then, no matter which post office in the world receives it (Windows, Mac, Linux), a local **interpreter** (the **JVM**) reads the universal language and delivers the message in the local tongue. That's exactly how Java works.

#### The Compilation and Execution Flow

```
  YourCode.java
       │
       ▼
  ┌──────────┐
  │  javac   │  (Java Compiler)
  │ compiler │
  └──────────┘
       │
       ▼
  YourCode.class  (Bytecode — platform independent)
       │
       ▼
  ┌──────────┐
  │   JVM    │  (Java Virtual Machine — platform specific)
  │          │
  └──────────┘
       │
       ▼
  Machine Code (Executed on your OS/Hardware)
```

#### Code Example: Your First Java Program

```java
// File: HelloJavaville.java
public class HelloJavaville {
    public static void main(String[] args) {
        System.out.println("Welcome to Javaville! 🏙️");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("OS Name: " + System.getProperty("os.name"));
        System.out.println("JVM Name: " + System.getProperty("java.vm.name"));
    }
}
```

**Compile and Run:**

```bash
javac HelloJavaville.java   # Translator converts to bytecode
java HelloJavaville          # JVM reads bytecode and runs it
```

**Output:**

```
Welcome to Javaville! 🏙️
Java Version: 21.0.1
OS Name: Linux
JVM Name: OpenJDK 64-Bit Server VM
```

**Explanation:** The `javac` command compiles your `.java` file into a `.class` bytecode file. The `java` command then launches the JVM, which reads the bytecode and executes it on your specific operating system. Notice that the same `.class` file would run on Windows, Mac, or Linux without any changes.

---

### JDK, JRE, and JVM Explained

> 🧰 **Story: The Toolbox, The Workshop, and The Engine**
> 
> Imagine you're building furniture.
> 
> - The **JDK (Java Development Kit)** is your **complete toolbox** — it has everything: saw, hammer, nails, sandpaper, AND the workshop itself. It's what developers use to *build* things.
> - The **JRE (Java Runtime Environment)** is the **workshop** — it has the machines and space to use the furniture (run the program), but you can't build new furniture here.
> - The **JVM (Java Virtual Machine)** is the **engine** inside every machine in the workshop — it's the thing that actually does the heavy lifting of running your program.

```
┌─────────────────────────────────────────────┐
│                   JDK                       │
│  ┌───────────────────────────────────────┐  │
│  │              JRE                      │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │            JVM                  │  │  │
│  │  │  • Class Loader                 │  │  │
│  │  │  • Bytecode Verifier            │  │  │
│  │  │  • Execution Engine             │  │  │
│  │  │    (Interpreter + JIT Compiler) │  │  │
│  │  │  • Garbage Collector            │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  • Java Class Libraries (rt.jar)      │  │
│  └───────────────────────────────────────┘  │
│  • javac (Compiler)                         │
│  • javadoc, jar, jdb (Debugger)             │
│  • Other development tools                  │
└─────────────────────────────────────────────┘
```

| Component | Purpose                 | Contains                             |
| --------- | ----------------------- | ------------------------------------ |
| **JDK**   | Development + Execution | JRE + Compiler + Dev Tools           |
| **JRE**   | Execution only          | JVM + Class Libraries                |
| **JVM**   | Runtime Engine          | Class Loader + Execution Engine + GC |

---

### Platform Independence: Write Once, Run Anywhere

```java
// File: PlatformDemo.java
public class PlatformDemo {
    public static void main(String[] args) {
        // This same bytecode runs everywhere!
        String os = System.getProperty("os.name");
        String arch = System.getProperty("os.arch");

        System.out.println("Running on: " + os + " (" + arch + ")");
        System.out.println("But the .class file is the SAME everywhere!");

        // Java handles differences internally
        String fileSeparator = System.getProperty("file.separator");
        System.out.println("File separator on this OS: " + fileSeparator);
        // Windows: \   Linux/Mac: /
    }
}
```

**Key Insight:** The `.class` bytecode file is identical across platforms. Only the JVM implementation differs per OS — it translates bytecode to the native machine code of that specific platform.

---

### JVM Memory Model

> 🏗️ **Story: The Office Building**
> 
> Think of the JVM memory as an office building:
> 
> - **Heap** — the giant open workspace where all employees (objects) sit. Shared by everyone.
> - **Stack** — each employee's personal desk. Every method call gets its own desk (stack frame) with drawers for local variables.
> - **Method Area** — the HR records room where class blueprints and static data are stored.
> - **PC Register** — each employee's to-do list pointer, tracking which instruction they're executing next.

```
┌──────────────────────────────────────┐
│              JVM Memory              │
├──────────────────────────────────────┤
│  HEAP (Shared across threads)        │
│  ┌────────────────────────────────┐  │
│  │  Young Generation              │  │
│  │  ├── Eden Space                │  │
│  │  ├── Survivor Space 1          │  │
│  │  └── Survivor Space 2          │  │
│  ├────────────────────────────────┤  │
│  │  Old Generation                │  │
│  │  (Long-lived objects)          │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  STACK (One per thread)              │
│  ┌────────────────────────────────┐  │
│  │  Frame: main()                 │  │
│  │    └── Local vars, operand     │  │
│  │  Frame: methodA()              │  │
│  │    └── Local vars, operand     │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  METHOD AREA (Class metadata)        │
│  NATIVE METHOD STACK                 │
│  PC REGISTERS                        │
└──────────────────────────────────────┘
```

```java
// File: MemoryDemo.java
public class MemoryDemo {
    // Static variable → stored in Method Area
    static int companyId = 100;

    // Instance variable → stored in Heap (with the object)
    String employeeName;

    public MemoryDemo(String name) {
        this.employeeName = name; // 'name' is on Stack, object is on Heap
    }

    public void introduce() {
        // Local variable → stored in Stack
        String greeting = "Hello, I'm " + employeeName;
        System.out.println(greeting);
    }

    public static void main(String[] args) {
        // 'emp1' reference is on Stack, the object it points to is on Heap
        MemoryDemo emp1 = new MemoryDemo("Alice");
        MemoryDemo emp2 = new MemoryDemo("Bob");

        emp1.introduce(); // New stack frame created for introduce()
        emp2.introduce(); // Another stack frame created

        // When main() ends, emp1 and emp2 references are popped from Stack.
        // The objects on Heap become eligible for Garbage Collection.
    }
}
```

**Explanation:**

- `companyId` is `static`, so it lives in the **Method Area** — one copy shared by all.
- `employeeName` is an instance variable — each object gets its own copy on the **Heap**.
- `greeting` inside `introduce()` is a local variable — it lives on the **Stack** and is destroyed when the method returns.
- `emp1`, `emp2` are references on the **Stack** that point to objects on the **Heap**.

---

## Basics of Object-Oriented Programming

### What is OOP? The Blueprint Story

> 🏠 **Story: The Architect and the Houses**
> 
> Imagine an architect named **Ravi**. He designs a blueprint for a house. The blueprint says: "Every house will have 4 rooms, 2 bathrooms, a kitchen, and a garden." Now, using this ONE blueprint, Ravi builds 5 different houses in different locations. Each house looks similar but has different colors, different furniture, and different families living inside.
> 
> In Java:
> 
> - The **blueprint** = **Class**
> - Each **house** = **Object** (instance of the class)
> - The **rooms, bathrooms** = **Attributes** (fields/properties)
> - The **families doing things** = **Methods** (behavior)

---

### Classes and Objects

```java
// File: House.java

// The Blueprint (Class)
class House {
    // Attributes (what the house HAS)
    String color;
    int numberOfRooms;
    String ownerName;
    boolean hasGarden;

    // Constructor (how to build the house)
    House(String color, int numberOfRooms, String ownerName, boolean hasGarden) {
        this.color = color;
        this.numberOfRooms = numberOfRooms;
        this.ownerName = ownerName;
        this.hasGarden = hasGarden;
    }

    // Behavior (what the house DOES)
    void displayInfo() {
        System.out.println("🏠 " + ownerName + "'s House");
        System.out.println("   Color: " + color);
        System.out.println("   Rooms: " + numberOfRooms);
        System.out.println("   Garden: " + (hasGarden ? "Yes 🌿" : "No"));
        System.out.println();
    }
}

// Main class
public class HouseDemo {
    public static void main(String[] args) {
        // Creating Objects (actual houses from the blueprint)
        House house1 = new House("White", 4, "Ravi", true);
        House house2 = new House("Blue", 3, "Priya", false);
        House house3 = new House("Yellow", 5, "Amit", true);

        // Each object is independent
        house1.displayInfo();
        house2.displayInfo();
        house3.displayInfo();
    }
}
```

**Output:**

```
🏠 Ravi's House
   Color: White
   Rooms: 4
   Garden: Yes 🌿

🏠 Priya's House
   Color: Blue
   Rooms: 3
   Garden: No

🏠 Amit's House
   Color: Yellow
   Rooms: 5
   Garden: Yes 🌿
```

**Explanation:** `House` is a class — the blueprint. `house1`, `house2`, `house3` are objects — actual houses built from that blueprint. Each has its own state (color, rooms, etc.) but shares the same structure and behaviors defined by the class.

---

### The Four Pillars of OOP

#### 1. Encapsulation — The Capsule Story

> 💊 **Story: The Medicine Capsule**
> 
> When you take a medicine capsule, you don't need to know the complex chemical compounds inside. You just swallow it, and it works. The capsule **hides** the complexity and **protects** the medicine from the outside environment. If the medicine were exposed, it could get contaminated.
> 
> Similarly, **encapsulation** means:
> 
> - **Wrapping** data (fields) and code (methods) into a single unit (class)
> - **Hiding** internal details using access modifiers (`private`)
> - **Providing controlled access** through getters and setters

```java
// File: BankAccount.java

// BAD EXAMPLE — Without Encapsulation
class UnsafeBankAccount {
    public double balance; // Anyone can directly modify!
    public String accountHolder;
}

// GOOD EXAMPLE — With Encapsulation
class BankAccount {
    // Private fields — hidden from outside
    private double balance;
    private String accountHolder;
    private String accountNumber;

    // Constructor
    public BankAccount(String accountHolder, String accountNumber, double initialDeposit) {
        this.accountHolder = accountHolder;
        this.accountNumber = accountNumber;
        if (initialDeposit >= 0) {
            this.balance = initialDeposit;
        } else {
            this.balance = 0;
            System.out.println("⚠️ Initial deposit cannot be negative. Set to 0.");
        }
    }

    // Getter — controlled READ access
    public double getBalance() {
        return balance;
    }

    public String getAccountHolder() {
        return accountHolder;
    }

    // No setter for accountNumber — it should never change!
    public String getAccountNumber() {
        // Return masked version for security
        return "XXXX-XXXX-" + accountNumber.substring(accountNumber.length() - 4);
    }

    // Controlled behavior — not a simple setter
    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("❌ Deposit amount must be positive!");
            return;
        }
        balance += amount;
        System.out.println("✅ Deposited ₹" + amount + " | New Balance: ₹" + balance);
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("❌ Withdrawal amount must be positive!");
            return;
        }
        if (amount > balance) {
            System.out.println("❌ Insufficient funds! Balance: ₹" + balance);
            return;
        }
        balance -= amount;
        System.out.println("✅ Withdrawn ₹" + amount + " | New Balance: ₹" + balance);
    }
}

public class EncapsulationDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("Ravi Kumar", "1234567890", 5000);

        // Cannot do: account.balance = 1000000; // COMPILE ERROR — balance is private!

        // Must use controlled methods:
        System.out.println("Account: " + account.getAccountNumber());
        System.out.println("Holder: " + account.getAccountHolder());
        System.out.println("Balance: ₹" + account.getBalance());
        System.out.println();

        account.deposit(2000);
        account.withdraw(1000);
        account.withdraw(100000);  // Insufficient funds!
        account.deposit(-500);     // Invalid amount!
    }
}
```

**Output:**

```
Account: XXXX-XXXX-7890
Holder: Ravi Kumar
Balance: ₹5000.0

✅ Deposited ₹2000.0 | New Balance: ₹7000.0
✅ Withdrawn ₹1000.0 | New Balance: ₹6000.0
❌ Insufficient funds! Balance: ₹6000.0
❌ Deposit amount must be positive!
```

**Explanation:** By making `balance` private, no one can directly set `balance = -9999`. All modifications must go through `deposit()` and `withdraw()`, which validate the input. This protects data integrity — just like the medicine capsule protects its contents.

---

#### 2. Inheritance — The Family Tree

> 👨‍👩‍👧‍👦 **Story: The Family Business**
> 
> The **Sharma family** runs a restaurant business. Grandpa Sharma started it with a recipe book (base class). His son inherited the entire recipe book AND added 10 fusion dishes. His granddaughter inherited everything from both AND added a vegan menu. Each generation **inherits** what the previous one had and **adds** or **modifies** things. They never had to rewrite the old recipes from scratch!

```java
// File: InheritanceDemo.java

// Grandparent class — the foundation
class Vehicle {
    protected String brand;
    protected String model;
    protected int year;
    protected double fuelCapacity;

    public Vehicle(String brand, String model, int year, double fuelCapacity) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.fuelCapacity = fuelCapacity;
    }

    public void start() {
        System.out.println("🔑 " + brand + " " + model + " is starting...");
    }

    public void stop() {
        System.out.println("🛑 " + brand + " " + model + " has stopped.");
    }

    public void displayInfo() {
        System.out.println("Brand: " + brand + " | Model: " + model + 
                         " | Year: " + year + " | Fuel: " + fuelCapacity + "L");
    }
}

// Child class — inherits everything + adds new features
class Car extends Vehicle {
    private int numberOfDoors;
    private boolean hasAC;

    public Car(String brand, String model, int year, double fuelCapacity, 
               int numberOfDoors, boolean hasAC) {
        super(brand, model, year, fuelCapacity); // Call parent constructor
        this.numberOfDoors = numberOfDoors;
        this.hasAC = hasAC;
    }

    // New method specific to Car
    public void playMusic() {
        System.out.println("🎵 Playing music in " + brand + " " + model);
    }

    // Override parent method — customize behavior
    @Override
    public void displayInfo() {
        super.displayInfo(); // Reuse parent's implementation
        System.out.println("Doors: " + numberOfDoors + " | AC: " + (hasAC ? "Yes ❄️" : "No"));
    }
}

// Grandchild class — inherits from Car (which inherits from Vehicle)
class ElectricCar extends Car {
    private double batteryCapacity; // in kWh
    private int range; // in km

    public ElectricCar(String brand, String model, int year, 
                       int numberOfDoors, double batteryCapacity, int range) {
        super(brand, model, year, 0, numberOfDoors, true); // 0 fuel — it's electric!
        this.batteryCapacity = batteryCapacity;
        this.range = range;
    }

    @Override
    public void start() {
        System.out.println("⚡ " + brand + " " + model + " silently powers up...");
    }

    public void chargeBattery() {
        System.out.println("🔋 Charging " + brand + " " + model + 
                         " (" + batteryCapacity + " kWh)...");
    }

    @Override
    public void displayInfo() {
        System.out.println("Brand: " + brand + " | Model: " + model + " | Year: " + year);
        System.out.println("Battery: " + batteryCapacity + " kWh | Range: " + range + " km");
    }
}

public class InheritanceDemo {
    public static void main(String[] args) {
        System.out.println("=== Regular Vehicle ===");
        Vehicle bike = new Vehicle("Honda", "Activa", 2023, 5.3);
        bike.start();
        bike.displayInfo();
        bike.stop();

        System.out.println("\n=== Car (inherits Vehicle) ===");
        Car sedan = new Car("Hyundai", "Creta", 2024, 50, 4, true);
        sedan.start();       // Inherited from Vehicle
        sedan.displayInfo(); // Overridden in Car
        sedan.playMusic();   // New in Car
        sedan.stop();        // Inherited from Vehicle

        System.out.println("\n=== Electric Car (inherits Car → Vehicle) ===");
        ElectricCar tesla = new ElectricCar("Tesla", "Model 3", 2024, 4, 75, 500);
        tesla.start();          // Overridden in ElectricCar
        tesla.displayInfo();    // Overridden in ElectricCar
        tesla.playMusic();      // Inherited from Car
        tesla.chargeBattery();  // New in ElectricCar
        tesla.stop();           // Inherited from Vehicle
    }
}
```

**Key Points:**

- `extends` keyword establishes inheritance
- `super()` calls the parent's constructor
- `@Override` marks methods that replace parent behavior
- A child class can use, override, or extend parent functionality
- Java supports **single inheritance** only (one parent class), but multiple levels are fine

---

#### 3. Polymorphism — The Shape Shifter

> 🎭 **Story: The Multi-Talented Actor**
> 
> Meet **Rajesh**, a Bollywood actor. In one movie he's a **soldier**, in another he's a **doctor**, and in a third, he's a **comedian**. The person is the same (Rajesh), but his behavior changes based on the role. When the director says "Action!", Rajesh **responds differently** depending on his current role. This is **polymorphism** — "one interface, many forms."
> 
> - **Compile-time polymorphism** (Method Overloading) = Rajesh deciding WHICH costume to wear before the shoot starts.
> - **Runtime polymorphism** (Method Overriding) = Rajesh acting DIFFERENTLY in front of the camera based on the scene.

```java
// File: PolymorphismDemo.java

// ====== COMPILE-TIME POLYMORPHISM (Method Overloading) ======

class Calculator {
    // Same method name, different parameter types/counts
    public int add(int a, int b) {
        System.out.println("Adding two integers");
        return a + b;
    }

    public double add(double a, double b) {
        System.out.println("Adding two doubles");
        return a + b;
    }

    public int add(int a, int b, int c) {
        System.out.println("Adding three integers");
        return a + b + c;
    }

    public String add(String a, String b) {
        System.out.println("Concatenating two strings");
        return a + b;
    }
}

// ====== RUNTIME POLYMORPHISM (Method Overriding) ======

class Notification {
    public void send(String message) {
        System.out.println("📨 Generic notification: " + message);
    }
}

class EmailNotification extends Notification {
    @Override
    public void send(String message) {
        System.out.println("📧 Email sent: " + message);
    }
}

class SMSNotification extends Notification {
    @Override
    public void send(String message) {
        System.out.println("📱 SMS sent: " + message);
    }
}

class PushNotification extends Notification {
    @Override
    public void send(String message) {
        System.out.println("🔔 Push notification: " + message);
    }
}

public class PolymorphismDemo {

    // This method accepts the PARENT type but calls the CHILD's behavior
    static void notifyUser(Notification notifier, String message) {
        notifier.send(message); // Which send() runs? Depends on the actual object!
    }

    public static void main(String[] args) {
        // ---- Compile-time Polymorphism ----
        System.out.println("=== Method Overloading ===");
        Calculator calc = new Calculator();
        System.out.println("Result: " + calc.add(5, 3));           // int version
        System.out.println("Result: " + calc.add(5.5, 3.2));      // double version
        System.out.println("Result: " + calc.add(1, 2, 3));       // three-param version
        System.out.println("Result: " + calc.add("Hello ", "World")); // String version

        // ---- Runtime Polymorphism ----
        System.out.println("\n=== Method Overriding ===");
        // Parent reference, child object — THE KEY TO POLYMORPHISM
        Notification email = new EmailNotification();
        Notification sms = new SMSNotification();
        Notification push = new PushNotification();

        notifyUser(email, "Your order has shipped!");
        notifyUser(sms, "OTP: 4829");
        notifyUser(push, "New message from Priya");

        // You can even use arrays/lists of the parent type
        System.out.println("\n=== Batch Notifications ===");
        Notification[] channels = { email, sms, push };
        for (Notification channel : channels) {
            channel.send("System maintenance at 2 AM");
        }
    }
}
```

**Output:**

```
=== Method Overloading ===
Adding two integers
Result: 8
Adding two doubles
Result: 8.7
Adding three integers
Result: 6
Concatenating two strings
Result: Hello World

=== Method Overriding ===
📧 Email sent: Your order has shipped!
📱 SMS sent: OTP: 4829
🔔 Push notification: New message from Priya

=== Batch Notifications ===
📧 Email sent: System maintenance at 2 AM
📱 SMS sent: System maintenance at 2 AM
🔔 Push notification: System maintenance at 2 AM
```

**Explanation:** In overloading, the compiler decides at compile time which `add()` to call based on argument types. In overriding, the JVM decides at runtime which `send()` to call based on the actual object type, not the reference type. This is why `Notification email = new EmailNotification()` calls `EmailNotification.send()`.

---

#### 4. Abstraction — The Car Dashboard

> 🚗 **Story: Driving a Car**
> 
> When you drive a car, you see a **dashboard** with a steering wheel, pedals, and gear stick. You don't see the thousands of mechanical and electronic parts working underneath. You press the accelerator — the car speeds up. You don't need to know about fuel injection, air-fuel ratio, piston movement, or the ECU.
> 
> The dashboard is an **abstraction** — it shows WHAT the car can do (accelerate, brake, turn) while hiding HOW it does it internally. Java achieves abstraction through **abstract classes** and **interfaces**.

```java
// File: AbstractionDemo.java

// Abstract class — partial abstraction (can have some implemented methods)
abstract class PaymentGateway {
    protected String merchantName;
    protected double transactionFee;

    public PaymentGateway(String merchantName, double transactionFee) {
        this.merchantName = merchantName;
        this.transactionFee = transactionFee;
    }

    // Abstract method — WHAT to do (no HOW)
    abstract boolean processPayment(double amount);
    abstract String getPaymentMethod();

    // Concrete method — shared behavior
    public void printReceipt(double amount) {
        double fee = amount * transactionFee;
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        System.out.println("  Receipt from " + merchantName);
        System.out.println("  Method: " + getPaymentMethod());
        System.out.println("  Amount: ₹" + amount);
        System.out.println("  Fee:    ₹" + String.format("%.2f", fee));
        System.out.println("  Total:  ₹" + String.format("%.2f", (amount + fee)));
        System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
}

// Concrete class — provides the HOW
class UPIPayment extends PaymentGateway {
    private String upiId;

    public UPIPayment(String merchantName, String upiId) {
        super(merchantName, 0.0); // UPI has no transaction fee
        this.upiId = upiId;
    }

    @Override
    boolean processPayment(double amount) {
        System.out.println("📲 Processing UPI payment of ₹" + amount + " via " + upiId);
        // Simulate processing
        return amount > 0 && amount <= 100000;
    }

    @Override
    String getPaymentMethod() {
        return "UPI (" + upiId + ")";
    }
}

class CreditCardPayment extends PaymentGateway {
    private String cardNumber;

    public CreditCardPayment(String merchantName, String cardNumber) {
        super(merchantName, 0.02); // 2% transaction fee
        this.cardNumber = cardNumber;
    }

    @Override
    boolean processPayment(double amount) {
        String maskedCard = "XXXX-XXXX-XXXX-" + cardNumber.substring(12);
        System.out.println("💳 Processing card payment of ₹" + amount + " via " + maskedCard);
        return amount > 0 && amount <= 500000;
    }

    @Override
    String getPaymentMethod() {
        return "Credit Card (XXXX-" + cardNumber.substring(12) + ")";
    }
}

public class AbstractionDemo {
    public static void main(String[] args) {
        // Cannot do: PaymentGateway pg = new PaymentGateway(); // COMPILE ERROR!

        // Must use concrete implementations
        PaymentGateway upi = new UPIPayment("Amazon", "user@paytm");
        PaymentGateway card = new CreditCardPayment("Flipkart", "4111222233334444");

        // Same interface, different implementation
        if (upi.processPayment(2500)) {
            upi.printReceipt(2500);
        }

        System.out.println();

        if (card.processPayment(15000)) {
            card.printReceipt(15000);
        }
    }
}
```

**Explanation:**

- `PaymentGateway` is **abstract** — you can't create an instance of it directly. It defines WHAT any payment should do (`processPayment`, `getPaymentMethod`).
- `UPIPayment` and `CreditCardPayment` are **concrete** — they provide the HOW (actual implementation).
- `printReceipt()` is a concrete method in the abstract class — shared logic that all payment types can use.

---

## Constructors in Java

> 🏗️ **Story: Building a House Step by Step**
> 
> When the builder comes to construct your house, he needs instructions. If you say nothing, he builds a **default house** (white walls, 2 rooms). If you say "I want 4 rooms and blue walls," he builds accordingly. If you give him an existing house and say "Make an exact copy," he builds a **clone**. These are your three types of constructors: **default**, **parameterized**, and **copy**.

```java
// File: ConstructorDemo.java

class Student {
    private String name;
    private int age;
    private String grade;
    private double gpa;

    // 1. Default Constructor (no arguments)
    public Student() {
        this.name = "Unknown";
        this.age = 0;
        this.grade = "N/A";
        this.gpa = 0.0;
        System.out.println("📝 Default student created");
    }

    // 2. Parameterized Constructor (with arguments)
    public Student(String name, int age, String grade, double gpa) {
        this.name = name;
        this.age = age;
        this.grade = grade;
        this.gpa = gpa;
        System.out.println("📝 Student " + name + " created with all details");
    }

    // 3. Copy Constructor (clone an existing object)
    public Student(Student other) {
        this.name = other.name;
        this.age = other.age;
        this.grade = other.grade;
        this.gpa = other.gpa;
        System.out.println("📝 Copy of " + other.name + " created");
    }

    // 4. Constructor Chaining (one constructor calls another)
    public Student(String name, int age) {
        this(name, age, "N/A", 0.0); // Calls the parameterized constructor
        System.out.println("   (Created with partial info, rest defaulted)");
    }

    public void display() {
        System.out.println("  Name: " + name + " | Age: " + age + 
                         " | Grade: " + grade + " | GPA: " + gpa);
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        System.out.println("--- Default Constructor ---");
        Student s1 = new Student();
        s1.display();

        System.out.println("\n--- Parameterized Constructor ---");
        Student s2 = new Student("Ananya", 20, "A+", 9.5);
        s2.display();

        System.out.println("\n--- Copy Constructor ---");
        Student s3 = new Student(s2); // Clone of s2
        s3.display();

        System.out.println("\n--- Constructor Chaining ---");
        Student s4 = new Student("Karan", 21);
        s4.display();
    }
}
```

---

## `this` and `super` Keywords

```java
// File: ThisAndSuperDemo.java

class Animal {
    String name;
    String sound;

    Animal(String name, String sound) {
        // 'this' refers to the CURRENT object
        this.name = name;   // distinguishes field from parameter
        this.sound = sound;
    }

    void speak() {
        System.out.println(this.name + " says: " + this.sound);
    }

    void info() {
        System.out.println("I am an Animal named " + name);
    }
}

class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        // 'super' calls the PARENT's constructor
        super(name, "Woof! 🐕");
        this.breed = breed;
    }

    @Override
    void info() {
        // 'super' calls the PARENT's version of info()
        super.info();
        System.out.println("Specifically, I am a " + breed + " dog");
    }

    // 'this' can also be used to call another constructor in the same class
    Dog(String name) {
        this(name, "Unknown Breed"); // calls Dog(String, String)
    }
}

public class ThisAndSuperDemo {
    public static void main(String[] args) {
        Dog tommy = new Dog("Tommy", "Labrador");
        tommy.speak();  // Inherited from Animal
        tommy.info();   // Overridden — calls super.info() internally

        System.out.println();

        Dog stray = new Dog("Buddy"); // Uses constructor chaining with 'this'
        stray.speak();
        stray.info();
    }
}
```

**Key Summary:**
| Keyword | Usage | Purpose |
|---------|-------|---------|
| `this` | `this.field`, `this()` | Refers to the current object; calls another constructor in the same class |
| `super` | `super.method()`, `super()` | Refers to the parent class; calls parent constructor or method |

---

## Static vs Instance Members

> 🏫 **Story: The University and Its Students**
> 
> In a university, the **university name** is the same for ALL students — it's shared information written on the entrance gate (this is `static`). But each student's **roll number**, **name**, and **marks** are personal — they differ for each student (these are `instance` members). If the university changes its name, all students automatically see the new name because it was always shared.

```java
// File: StaticVsInstance.java

class Employee {
    // Static variable — shared by ALL objects
    static String companyName = "TechCorp";
    static int totalEmployees = 0;

    // Instance variables — unique per object
    int employeeId;
    String name;
    double salary;

    // Constructor
    Employee(String name, double salary) {
        totalEmployees++; // Shared counter increments
        this.employeeId = totalEmployees;
        this.name = name;
        this.salary = salary;
    }

    // Instance method — can access both static and instance members
    void displayInfo() {
        System.out.println("[" + companyName + "] Employee #" + employeeId + 
                         ": " + name + " | Salary: ₹" + salary);
    }

    // Static method — can ONLY access static members directly
    static void displayCompanyInfo() {
        System.out.println("Company: " + companyName);
        System.out.println("Total Employees: " + totalEmployees);
        // Cannot access: this.name — 'this' doesn't exist in static context!
    }

    // Static block — runs ONCE when class is first loaded
    static {
        System.out.println("🏢 " + companyName + " system initialized!");
    }
}

public class StaticVsInstance {
    public static void main(String[] args) {
        Employee.displayCompanyInfo(); // Called without creating any object
        System.out.println();

        Employee emp1 = new Employee("Alice", 75000);
        Employee emp2 = new Employee("Bob", 82000);
        Employee emp3 = new Employee("Charlie", 68000);

        emp1.displayInfo();
        emp2.displayInfo();
        emp3.displayInfo();
        System.out.println();

        // Change company name — affects ALL employees
        Employee.companyName = "TechCorp Global";
        System.out.println("--- After company rename ---");
        emp1.displayInfo(); // Now shows "TechCorp Global"
        emp2.displayInfo();

        System.out.println();
        Employee.displayCompanyInfo();
    }
}
```

---

## Complete Project: Employee Management System

```java
// File: EmployeeManagementSystem.java

// Base class
abstract class Staff {
    private static int idCounter = 0;

    protected int id;
    protected String name;
    protected String department;

    public Staff(String name, String department) {
        this.id = ++idCounter;
        this.name = name;
        this.department = department;
    }

    abstract double calculateSalary();

    public void displayDetails() {
        System.out.println("ID: " + id + " | Name: " + name + 
                         " | Dept: " + department + 
                         " | Salary: ₹" + String.format("%.2f", calculateSalary()));
    }
}

// Full-time employee
class FullTimeEmployee extends Staff {
    private double monthlySalary;
    private double bonus;

    public FullTimeEmployee(String name, String department, double monthlySalary, double bonus) {
        super(name, department);
        this.monthlySalary = monthlySalary;
        this.bonus = bonus;
    }

    @Override
    double calculateSalary() {
        return monthlySalary + bonus;
    }
}

// Contract employee
class ContractEmployee extends Staff {
    private double hourlyRate;
    private int hoursWorked;

    public ContractEmployee(String name, String department, double hourlyRate, int hoursWorked) {
        super(name, department);
        this.hourlyRate = hourlyRate;
        this.hoursWorked = hoursWorked;
    }

    @Override
    double calculateSalary() {
        double basePay = hourlyRate * hoursWorked;
        double overtime = hoursWorked > 160 ? (hoursWorked - 160) * hourlyRate * 1.5 : 0;
        return basePay + overtime;
    }
}

// Intern
class Intern extends Staff {
    private double stipend;

    public Intern(String name, String department, double stipend) {
        super(name, department);
        this.stipend = stipend;
    }

    @Override
    double calculateSalary() {
        return stipend;
    }
}

public class EmployeeManagementSystem {
    public static void main(String[] args) {
        Staff[] employees = {
            new FullTimeEmployee("Ananya Sharma", "Engineering", 80000, 15000),
            new FullTimeEmployee("Karan Mehta", "Marketing", 65000, 10000),
            new ContractEmployee("Priya Patel", "Design", 500, 180),
            new ContractEmployee("Rahul Gupta", "Engineering", 600, 150),
            new Intern("Sneha Reddy", "HR", 15000),
        };

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("              EMPLOYEE MANAGEMENT SYSTEM                  ");
        System.out.println("═══════════════════════════════════════════════════════════");

        double totalPayroll = 0;
        for (Staff emp : employees) {
            emp.displayDetails(); // Polymorphism! Correct calculateSalary() is called
            totalPayroll += emp.calculateSalary();
        }

        System.out.println("═══════════════════════════════════════════════════════════");
        System.out.println("Total Monthly Payroll: ₹" + String.format("%.2f", totalPayroll));
        System.out.println("═══════════════════════════════════════════════════════════");
    }
}
```

This project demonstrates **all four OOP pillars**:

- **Encapsulation:** Private fields with controlled access
- **Inheritance:** `FullTimeEmployee`, `ContractEmployee`, `Intern` extend `Staff`
- **Polymorphism:** `calculateSalary()` behaves differently for each type
- **Abstraction:** `Staff` is abstract — defines WHAT, not HOW

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between JDK, JRE, and JVM?**

**A:** JDK (Java Development Kit) is a superset that contains the JRE plus development tools like the compiler (`javac`), debugger, and documentation generator. JRE (Java Runtime Environment) contains the JVM plus standard class libraries needed to run Java programs. JVM (Java Virtual Machine) is the actual runtime engine that executes bytecode. Think of it as: **JDK ⊃ JRE ⊃ JVM**. A developer needs JDK, an end-user only needs JRE.

---

**Q2: Why is Java called "platform independent" but JVM is "platform dependent"?**

**A:** Java source code compiles to bytecode (`.class` files), which is the same regardless of the OS. This makes Java programs platform-independent. However, the JVM that interprets this bytecode must be specifically built for each OS (Windows JVM, Linux JVM, macOS JVM) to translate bytecode to native machine instructions. So the **code** is platform-independent, but the **execution engine** is platform-dependent. This is the "Write Once, Run Anywhere" principle.

---

**Q3: Can you explain polymorphism with a real-world backend scenario?**

**A:** Consider a notification system in a backend service. You have a `NotificationService` interface with a `send(String userId, String message)` method. Different implementations exist: `EmailNotificationService`, `SMSNotificationService`, `PushNotificationService`. The controller injects `NotificationService` and calls `send()` — at runtime, Spring determines which implementation to use based on the bean configuration. This allows you to switch notification providers without changing the controller code. This is runtime polymorphism powered by dependency injection.

---

**Q4: What is the difference between method overloading and method overriding?**

**A:**

| Aspect               | Overloading          | Overriding                    |
| -------------------- | -------------------- | ----------------------------- |
| **When resolved**    | Compile-time         | Runtime                       |
| **Where**            | Same class           | Parent-child class            |
| **Method signature** | Different parameters | Same parameters               |
| **Return type**      | Can be different     | Must be same/covariant        |
| **Access modifier**  | Can be anything      | Cannot be more restrictive    |
| **`static` methods** | Can be overloaded    | Cannot be overridden (hidden) |

---

**Q5: What happens if you don't provide any constructor in a class?**

**A:** Java automatically provides a **default no-argument constructor** that initializes all primitive fields to their default values (0, false, etc.) and reference fields to `null`. However, if you define ANY constructor (even a parameterized one), Java does NOT provide the default constructor anymore. This is why adding a parameterized constructor can break code that relies on `new ClassName()`.

---

### Medium-Hard Questions

**Q6: What is the diamond problem in Java, and how does Java solve it?**

**A:** The diamond problem occurs when a class inherits from two classes that both inherit from a common ancestor. If both parent classes override a method from the ancestor, the child class doesn't know which version to use.

Java prevents this entirely by **not allowing multiple class inheritance** (`extends` only one class). However, from Java 8, a similar problem can arise with **interfaces that have default methods**. If a class implements two interfaces with the same default method, the compiler forces you to override the method and explicitly choose which one to call using `InterfaceName.super.method()`.

```java
interface A {
    default void hello() { System.out.println("Hello from A"); }
}
interface B {
    default void hello() { System.out.println("Hello from B"); }
}
class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // Explicitly choose A's version
    }
}
```

---

**Q7: Explain the difference between `==` and `.equals()` for objects. When would `==` return `true` for two different String objects?**

**A:** `==` compares **references** (do both variables point to the exact same object in memory?), while `.equals()` compares **logical equality** (do the objects contain the same data?).

For Strings, `==` can return `true` for two "different" String literals because of **String Pool optimization**. When you write `String s1 = "Hello"` and `String s2 = "Hello"`, Java stores only one "Hello" in the String Pool and both variables point to it. But `String s3 = new String("Hello")` creates a NEW object on the heap, so `s1 == s3` returns `false` even though `s1.equals(s3)` returns `true`.

```java
String s1 = "Hello";
String s2 = "Hello";
String s3 = new String("Hello");

System.out.println(s1 == s2);      // true  (same String Pool reference)
System.out.println(s1 == s3);      // false (different objects)
System.out.println(s1.equals(s3)); // true  (same content)
```

---

**Q8: Can a constructor be `private`? Give a practical use case.**

**A:** Yes! A private constructor prevents external instantiation. The primary use case is the **Singleton Design Pattern**, where only one instance of a class should exist:

```java
class DatabaseConnection {
    private static DatabaseConnection instance;

    private DatabaseConnection() {
        // Private — no one outside can call 'new DatabaseConnection()'
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();
        }
        return instance;
    }
}
```

Other uses: utility classes (like `java.lang.Math`) with only static methods, factory patterns, and builder patterns. It's a key tool in controlling object creation.

---

**Q9: What is the output of the following code? Explain why.**

```java
class Parent {
    int x = 10;
    Parent() {
        printX();
    }
    void printX() {
        System.out.println("Parent x = " + x);
    }
}

class Child extends Parent {
    int x = 20;
    @Override
    void printX() {
        System.out.println("Child x = " + x);
    }
}

public class Test {
    public static void main(String[] args) {
        Parent obj = new Child();
        obj.printX();
    }
}
```

**A:** The output is:

```
Child x = 0
Child x = 20
```

**Explanation:** When `new Child()` is called, the Parent constructor runs first (because of `super()` implicit call). Inside the Parent constructor, `printX()` is called — but due to **dynamic dispatch (runtime polymorphism)**, `Child.printX()` runs, NOT `Parent.printX()`. At this point, `Child`'s field `x` hasn't been initialized yet (constructors run in order: Parent fields → Parent constructor → Child fields → Child constructor), so it's still `0`. The second call `obj.printX()` works normally because by then `Child.x = 20`.

This is a classic trap: **never call overridable methods from constructors**.

---

**Q10: Explain the difference between Heap and Stack memory. What happens when a Stack Overflow or OutOfMemoryError occurs?**

**A:**

| Aspect       | Stack                                      | Heap                        |
| ------------ | ------------------------------------------ | --------------------------- |
| **Stores**   | Local variables, method frames, references | Objects, instance variables |
| **Lifetime** | Until method returns                       | Until garbage collected     |
| **Access**   | Thread-specific (each thread has its own)  | Shared across threads       |
| **Speed**    | Faster (LIFO structure)                    | Slower (complex allocation) |
| **Size**     | Small (typically 512KB–1MB)                | Large (can be GBs)          |

- **StackOverflowError**: Occurs when the stack runs out of space, usually due to infinite/deep recursion. Each method call creates a new stack frame, and if the recursion never terminates, frames keep piling up.

- **OutOfMemoryError**: Occurs when the heap is full and GC can't free enough space. This happens when too many objects are created and retained (memory leak), or when the heap size is too small for the workload.

```java
// StackOverflowError example
void infinite() { infinite(); } // Each call adds a frame → Stack explodes

// OutOfMemoryError example
List<byte[]> list = new ArrayList<>();
while (true) {
    list.add(new byte[1024 * 1024]); // 1MB each, never freed → Heap explodes
}
```

---

> 🎯 **Session 1 Summary:** You've learned how Java's architecture (JDK → JRE → JVM) enables platform independence, how JVM memory is organized, and the four pillars of OOP — Encapsulation, Inheritance, Polymorphism, and Abstraction — each illustrated with stories, code, and practical examples. This foundation is critical for everything that follows in your Java backend journey!
