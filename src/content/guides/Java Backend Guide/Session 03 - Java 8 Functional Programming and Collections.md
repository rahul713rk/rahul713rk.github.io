# Session 3: Java 8 Functional Programming & Collections Overview

---

## Table of Contents

1. [Lambda Expressions](#lambda-expressions)
2. [Functional Interfaces](#functional-interfaces)
3. [Built-in Functional Interfaces](#built-in-functional-interfaces)
4. [Method References](#method-references)
5. [Java Collections Framework Overview](#java-collections-framework-overview)
6. [Lists, Sets, and Maps Deep-Dive](#lists-sets-and-maps-deep-dive)
7. [Introduction to Queues](#introduction-to-queues)
8. [Complete Project: Student Grade Analyzer](#complete-project-student-grade-analyzer)
9. [Interview Questions & Answers](#interview-questions--answers)

---

## Lambda Expressions

> 🎵 **Story: The Jukebox**
> 
> Imagine an old jukebox in a café. Normally, you must insert a full CD (a named class implementing an interface) for it to play music. But what if you could just whisper the instructions — "play this melody" — without needing a physical CD at all? That's what **lambda expressions** do in Java: they let you pass behavior (functions) as arguments without creating a full class. They're the *whispered instructions* to the jukebox.
> 
> Before lambdas, to sort a list, you had to create an anonymous inner class. With lambdas, that 5-line mess becomes a one-liner.

### Before vs After Lambdas

```java
// File: LambdaIntro.java
import java.util.*;

public class LambdaIntro {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Rahul", "Ananya", "Karan", "Priya", "Amit");

        // ========= BEFORE Java 8: Anonymous Inner Class =========
        System.out.println("--- Before Lambda (Java 7 style) ---");
        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.compareTo(b);
            }
        });
        System.out.println(names);

        // Shuffle for demo
        Collections.shuffle(names);

        // ========= AFTER Java 8: Lambda Expression =========
        System.out.println("\n--- With Lambda (Java 8+) ---");
        Collections.sort(names, (a, b) -> a.compareTo(b));
        System.out.println(names);

        // Even shorter using method reference
        Collections.shuffle(names);
        System.out.println("\n--- With Method Reference ---");
        names.sort(String::compareTo);
        System.out.println(names);
    }
}
```

### Lambda Syntax Breakdown

```java
// Full lambda syntax
(String a, String b) -> { return a.compareTo(b); }

// Type inference — compiler knows the types
(a, b) -> { return a.compareTo(b); }

// Single expression — no braces, no return keyword
(a, b) -> a.compareTo(b)

// Single parameter — no parentheses needed
name -> name.toUpperCase()

// No parameters
() -> System.out.println("Hello!")
```

```java
// File: LambdaSyntaxDemo.java
import java.util.*;

public class LambdaSyntaxDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9, 3, 7, 4, 6);

        // Lambda to print each number
        System.out.println("All numbers:");
        numbers.forEach(n -> System.out.print(n + " "));
        System.out.println();

        // Lambda to filter even numbers  
        System.out.println("\nEven numbers:");
        numbers.stream()
               .filter(n -> n % 2 == 0)
               .forEach(n -> System.out.print(n + " "));
        System.out.println();

        // Lambda to transform: square each number
        System.out.println("\nSquared:");
        numbers.stream()
               .map(n -> n * n)
               .forEach(n -> System.out.print(n + " "));
        System.out.println();

        // Multi-line lambda (with braces)
        numbers.forEach(n -> {
            if (n > 5) {
                System.out.println(n + " is greater than 5");
            }
        });
    }
}
```

---

## Functional Interfaces

> 📱 **Story: The Universal Remote**
> 
> A universal remote has ONE button for each function — one for power, one for volume. A **functional interface** is like a remote with exactly **ONE abstract method**. That single method defines what the "remote" does. Lambda expressions are the batteries that power these remotes.

### What Makes It Functional?

A functional interface has **exactly one abstract method**. It can have any number of `default` and `static` methods.

```java
// File: FunctionalInterfaceDemo.java

// Custom Functional Interface — marked with @FunctionalInterface
@FunctionalInterface
interface MathOperation {
    double operate(double a, double b); // THE one abstract method

    // Default methods are allowed
    default void printInfo() {
        System.out.println("This is a math operation");
    }
}

@FunctionalInterface
interface StringProcessor {
    String process(String input);
}

@FunctionalInterface
interface Validator<T> {
    boolean isValid(T item);
}

public class FunctionalInterfaceDemo {

    // Accept behavior as a parameter
    static double calculate(double a, double b, MathOperation operation) {
        return operation.operate(a, b);
    }

    static String transform(String input, StringProcessor processor) {
        return processor.process(input);
    }

    public static void main(String[] args) {
        // Passing different behaviors using lambdas
        MathOperation addition = (a, b) -> a + b;
        MathOperation subtraction = (a, b) -> a - b;
        MathOperation multiplication = (a, b) -> a * b;
        MathOperation power = (a, b) -> Math.pow(a, b);

        System.out.println("10 + 5 = " + calculate(10, 5, addition));
        System.out.println("10 - 5 = " + calculate(10, 5, subtraction));
        System.out.println("10 * 5 = " + calculate(10, 5, multiplication));
        System.out.println("10 ^ 5 = " + calculate(10, 5, power));

        System.out.println();

        // String transformations
        System.out.println(transform("hello world", s -> s.toUpperCase()));
        System.out.println(transform("  trim me  ", s -> s.trim()));
        System.out.println(transform("reverse", s -> new StringBuilder(s).reverse().toString()));

        System.out.println();

        // Validators
        Validator<String> emailValidator = email -> email.contains("@") && email.contains(".");
        Validator<Integer> ageValidator = age -> age >= 18 && age <= 120;
        Validator<String> passwordValidator = pwd -> pwd.length() >= 8 
                && pwd.chars().anyMatch(Character::isDigit)
                && pwd.chars().anyMatch(Character::isUpperCase);

        System.out.println("Valid email? " + emailValidator.isValid("user@email.com"));
        System.out.println("Valid age? " + ageValidator.isValid(25));
        System.out.println("Valid password? " + passwordValidator.isValid("MyPass123"));
        System.out.println("Weak password? " + passwordValidator.isValid("weak"));
    }
}
```

---

## Built-in Functional Interfaces

Java 8 provides commonly needed functional interfaces in `java.util.function`:

| Interface             | Method              | Description                 | Example                      |
| --------------------- | ------------------- | --------------------------- | ---------------------------- |
| `Predicate<T>`        | `boolean test(T t)` | Tests a condition           | `x -> x > 0`                 |
| `Function<T, R>`      | `R apply(T t)`      | Transforms T to R           | `s -> s.length()`            |
| `Consumer<T>`         | `void accept(T t)`  | Consumes T, returns nothing | `s -> System.out.println(s)` |
| `Supplier<T>`         | `T get()`           | Produces a value            | `() -> new ArrayList<>()`    |
| `UnaryOperator<T>`    | `T apply(T t)`      | Transform T to T            | `x -> x * 2`                 |
| `BinaryOperator<T>`   | `T apply(T a, T b)` | Combine two T values        | `(a, b) -> a + b`            |
| `BiFunction<T, U, R>` | `R apply(T t, U u)` | Two inputs, one output      | `(a, b) -> a + b`            |

```java
// File: BuiltInFunctionalDemo.java
import java.util.*;
import java.util.function.*;

public class BuiltInFunctionalDemo {
    public static void main(String[] args) {

        // ========= PREDICATE — Returns boolean =========
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isEvenAndPositive = isEven.and(isPositive); // Combining!

        System.out.println("Is 4 even & positive? " + isEvenAndPositive.test(4));   // true
        System.out.println("Is -2 even & positive? " + isEvenAndPositive.test(-2)); // false

        // Use Predicate for filtering
        List<Integer> numbers = Arrays.asList(1, -2, 3, -4, 5, -6, 7, 8);
        System.out.print("Positive numbers: ");
        numbers.stream().filter(isPositive).forEach(n -> System.out.print(n + " "));
        System.out.println();

        // ========= FUNCTION — Transform input to output =========
        Function<String, Integer> stringLength = String::length;
        Function<Integer, String> intToCategory = n -> {
            if (n > 90) return "Excellent";
            if (n > 70) return "Good";
            if (n > 50) return "Average";
            return "Below Average";
        };

        System.out.println("\nLength of 'Hello': " + stringLength.apply("Hello"));

        // Chaining: String → length → category
        Function<String, String> lengthCategory = stringLength.andThen(intToCategory);
        System.out.println("Category of 'This is a very very long sentence': " + 
                         lengthCategory.apply("This is a very very long sentence"));

        // ========= CONSUMER — Takes input, returns nothing =========
        Consumer<String> print = System.out::println;
        Consumer<String> shout = s -> System.out.println(s.toUpperCase() + "!!!");
        Consumer<String> printThenShout = print.andThen(shout);

        System.out.println();
        printThenShout.accept("hello world");

        // ========= SUPPLIER — Takes nothing, produces output =========
        Supplier<Double> randomPrice = () -> Math.round(Math.random() * 10000) / 100.0;
        Supplier<String> randomId = () -> "ID-" + UUID.randomUUID().toString().substring(0, 8);

        System.out.println("\nRandom price: ₹" + randomPrice.get());
        System.out.println("Random ID: " + randomId.get());

        // ========= BIFUNCTION — Two inputs, one output =========
        BiFunction<String, String, String> fullName = (first, last) -> first + " " + last;
        BiFunction<Double, Double, Double> calculateTax = (price, rate) -> price * rate / 100;

        System.out.println("\nFull name: " + fullName.apply("Ravi", "Kumar"));
        System.out.println("Tax on ₹5000 at 18%: ₹" + calculateTax.apply(5000.0, 18.0));
    }
}
```

---

## Method References

> 🏷️ **Story: Name Tags at a Conference**
> 
> At a conference, instead of saying "Go to the person who is standing near the window, wearing a blue shirt, and has glasses" — you just look at their **name tag** and call them by name. Method references are like name tags for lambdas — a shorthand way to refer to existing methods.

```java
// File: MethodReferenceDemo.java
import java.util.*;
import java.util.function.*;

class User {
    String name;
    int age;

    User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Instance method
    String getGreeting() {
        return "Hi, I'm " + name + " (" + age + ")";
    }

    // Static method
    static User createDefault() {
        return new User("Guest", 0);
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class MethodReferenceDemo {

    static boolean isAdult(User user) {
        return user.age >= 18;
    }

    public static void main(String[] args) {
        List<String> names = Arrays.asList("Charlie", "Alice", "Bob", "Diana");

        // 1. Reference to a STATIC method — ClassName::staticMethod
        // Lambda:  s -> System.out.println(s)
        // Method ref: System.out::println
        names.forEach(System.out::println);

        // 2. Reference to an INSTANCE method of a particular object
        // Lambda:  s -> System.out.println(s)
        names.forEach(System.out::println); // System.out is the particular object

        // 3. Reference to an INSTANCE method of an arbitrary object of a type
        // Lambda: (a, b) -> a.compareTo(b)
        // Method ref: String::compareTo
        names.sort(String::compareTo);
        System.out.println("Sorted: " + names);

        // 4. Reference to a CONSTRUCTOR — ClassName::new
        // Lambda: () -> new ArrayList<>()
        Supplier<List<String>> listFactory = ArrayList::new;
        List<String> newList = listFactory.get();
        System.out.println("New empty list: " + newList);

        // Practical example with Users
        List<User> users = Arrays.asList(
            new User("Amit", 25),
            new User("Priya", 17),
            new User("Karan", 30),
            new User("Sneha", 15)
        );

        // Static method reference as Predicate
        Predicate<User> adultCheck = MethodReferenceDemo::isAdult;
        users.stream()
             .filter(adultCheck)
             .map(User::getGreeting) // Instance method reference
             .forEach(System.out::println);
    }
}
```

**Four Types of Method References:**

| Type                        | Syntax                      | Lambda Equivalent                   |
| --------------------------- | --------------------------- | ----------------------------------- |
| Static method               | `ClassName::staticMethod`   | `x -> ClassName.staticMethod(x)`    |
| Instance method (specific)  | `instance::method`          | `x -> instance.method(x)`           |
| Instance method (arbitrary) | `ClassName::instanceMethod` | `(obj, x) -> obj.instanceMethod(x)` |
| Constructor                 | `ClassName::new`            | `x -> new ClassName(x)`             |

---

## Java Collections Framework Overview

> 🏢 **Story: The Office Supply Room**
> 
> Picture a large office supply room:
> 
> - **List** = A numbered shelf where items are stored in ORDER. You can have duplicates. "Give me item #3" → `get(3)`. Think of it like a queue at a bank — everyone has a position.
> - **Set** = A bag of unique items. No duplicates allowed. Like a bag of unique stamps in a collection — if you try to add a duplicate, it's ignored.
> - **Map** = A filing cabinet where each drawer has a LABEL (key) and stores ONE document (value). Like a phone book: name → number. No two drawers have the same label.
> - **Queue** = The ticket counter. First person in line is served first (FIFO). A Deque is like a corridor — you can enter from either end.

```
┌─────────────────────────────────────────────────────────────┐
│                   Collection (interface)                     │
├──────────────────┬──────────────────┬───────────────────────┤
│      List        │       Set        │        Queue          │
│   (ordered,      │   (unique,       │     (FIFO order)      │
│    indexed)      │    no dups)      │                       │
├──────────────────┼──────────────────┼───────────────────────┤
│ • ArrayList      │ • HashSet        │ • LinkedList          │
│ • LinkedList     │ • LinkedHashSet  │ • PriorityQueue       │
│ • Vector         │ • TreeSet        │ • ArrayDeque          │
└──────────────────┴──────────────────┴───────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Map (interface)                        │
│               (key-value pairs, unique keys)                │
├─────────────────────────────────────────────────────────────┤
│ • HashMap        • LinkedHashMap       • TreeMap            │
│ • Hashtable      • ConcurrentHashMap                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Lists, Sets, and Maps Deep-Dive

```java
// File: CollectionsDeepDive.java
import java.util.*;

public class CollectionsDeepDive {
    public static void main(String[] args) {

        // ============ LIST — Ordered, Indexed, Allows Duplicates ============
        System.out.println("═══════ LIST ═══════");

        // ArrayList — fast random access, slow insert/delete in middle
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Apple");  // Duplicates allowed!
        fruits.add("Cherry");
        fruits.add(1, "Mango"); // Insert at index 1

        System.out.println("Fruits: " + fruits);
        System.out.println("Element at index 2: " + fruits.get(2));
        System.out.println("Index of 'Cherry': " + fruits.indexOf("Cherry"));

        // LinkedList — fast insert/delete, slow random access
        LinkedList<String> tasks = new LinkedList<>();
        tasks.add("Task 1");
        tasks.addFirst("Urgent Task");  // Add at beginning — O(1)
        tasks.addLast("Low Priority");   // Add at end — O(1)
        System.out.println("Tasks: " + tasks);

        // When to use which?
        // ArrayList: Random access (get by index), reading > writing
        // LinkedList: Frequent insert/delete at start/middle, queue operations

        System.out.println();

        // ============ SET — Unique Elements, No Duplicates ============
        System.out.println("═══════ SET ═══════");

        // HashSet — no order guaranteed, fastest (O(1) operations)
        Set<String> skills = new HashSet<>();
        skills.add("Java");
        skills.add("Python");
        skills.add("Java");     // Duplicate — ignored!
        skills.add("JavaScript");
        System.out.println("HashSet (no order): " + skills);

        // LinkedHashSet — maintains INSERTION order
        Set<String> orderedSkills = new LinkedHashSet<>();
        orderedSkills.add("Java");
        orderedSkills.add("Spring");
        orderedSkills.add("Hibernate");
        orderedSkills.add("Java"); // Duplicate — ignored
        System.out.println("LinkedHashSet (insertion order): " + orderedSkills);

        // TreeSet — SORTED order (natural ordering or Comparator)
        Set<Integer> scores = new TreeSet<>();
        scores.add(85);
        scores.add(92);
        scores.add(78);
        scores.add(95);
        scores.add(88);
        System.out.println("TreeSet (sorted): " + scores);

        // Set operations
        Set<String> backend = new HashSet<>(Arrays.asList("Java", "Python", "Go", "Node.js"));
        Set<String> frontend = new HashSet<>(Arrays.asList("JavaScript", "TypeScript", "Python", "Node.js"));

        // Intersection
        Set<String> common = new HashSet<>(backend);
        common.retainAll(frontend);
        System.out.println("Common: " + common);

        // Union
        Set<String> all = new HashSet<>(backend);
        all.addAll(frontend);
        System.out.println("Union: " + all);

        // Difference
        Set<String> onlyBackend = new HashSet<>(backend);
        onlyBackend.removeAll(frontend);
        System.out.println("Only Backend: " + onlyBackend);

        System.out.println();

        // ============ MAP — Key-Value Pairs ============
        System.out.println("═══════ MAP ═══════");

        // HashMap — no order guaranteed, fastest
        Map<String, Integer> studentMarks = new HashMap<>();
        studentMarks.put("Amit", 85);
        studentMarks.put("Priya", 92);
        studentMarks.put("Karan", 78);
        studentMarks.put("Amit", 90); // Overwrites previous value for "Amit"!

        System.out.println("Marks: " + studentMarks);
        System.out.println("Amit's marks: " + studentMarks.get("Amit"));
        System.out.println("Contains 'Priya'? " + studentMarks.containsKey("Priya"));
        System.out.println("Default value: " + studentMarks.getOrDefault("Unknown", -1));

        // Iterating a Map
        System.out.println("\nAll entries:");
        for (Map.Entry<String, Integer> entry : studentMarks.entrySet()) {
            System.out.println("  " + entry.getKey() + " → " + entry.getValue());
        }

        // Java 8 forEach
        studentMarks.forEach((name, marks) -> {
            String grade = marks >= 90 ? "A+" : marks >= 80 ? "A" : "B";
            System.out.println("  " + name + ": " + marks + " (" + grade + ")");
        });

        // TreeMap — sorted by keys
        Map<String, String> phoneBook = new TreeMap<>();
        phoneBook.put("Charlie", "333-3333");
        phoneBook.put("Alice", "111-1111");
        phoneBook.put("Bob", "222-2222");
        System.out.println("\nTreeMap (sorted): " + phoneBook);
    }
}
```

---

## Introduction to Queues

> 🎟️ **Story: The Movie Ticket Counter**
> 
> At a movie theater, people stand in a **queue**. The first person to arrive gets served first (FIFO). A **PriorityQueue** is like a hospital ER — patients with critical conditions get treated first, regardless of arrival order.

```java
// File: QueueDemo.java
import java.util.*;

public class QueueDemo {
    public static void main(String[] args) {

        // ========= Regular Queue (FIFO) =========
        System.out.println("═══ Queue (FIFO) ═══");
        Queue<String> ticketQueue = new LinkedList<>();
        ticketQueue.offer("Customer 1"); // offer = add (doesn't throw exception if full)
        ticketQueue.offer("Customer 2");
        ticketQueue.offer("Customer 3");
        ticketQueue.offer("Customer 4");

        System.out.println("Queue: " + ticketQueue);
        System.out.println("Front of queue (peek): " + ticketQueue.peek()); // Doesn't remove
        System.out.println("Serving: " + ticketQueue.poll()); // Removes and returns head
        System.out.println("Serving: " + ticketQueue.poll());
        System.out.println("Remaining: " + ticketQueue);

        System.out.println();

        // ========= Priority Queue =========
        System.out.println("═══ PriorityQueue ═══");
        // Natural ordering: smallest first
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(30);
        minHeap.offer(10);
        minHeap.offer(50);
        minHeap.offer(20);

        System.out.print("Min-Heap order: ");
        while (!minHeap.isEmpty()) {
            System.out.print(minHeap.poll() + " "); // 10 20 30 50
        }
        System.out.println();

        // Custom priority: task priority system
        PriorityQueue<String[]> taskQueue = new PriorityQueue<>(
            (a, b) -> Integer.parseInt(a[0]) - Integer.parseInt(b[0]) // Sort by priority number
        );
        taskQueue.offer(new String[]{"3", "Write documentation"});
        taskQueue.offer(new String[]{"1", "Fix critical bug"});
        taskQueue.offer(new String[]{"2", "Deploy to staging"});

        System.out.println("\nProcessing tasks by priority:");
        while (!taskQueue.isEmpty()) {
            String[] task = taskQueue.poll();
            System.out.println("  Priority " + task[0] + ": " + task[1]);
        }

        System.out.println();

        // ========= Deque (Double-Ended Queue) =========
        System.out.println("═══ Deque ═══");
        Deque<String> deque = new ArrayDeque<>();
        deque.offerFirst("B"); // Add to front
        deque.offerFirst("A"); // Add to front
        deque.offerLast("C");  // Add to back
        deque.offerLast("D");  // Add to back

        System.out.println("Deque: " + deque);
        System.out.println("First: " + deque.peekFirst());
        System.out.println("Last: " + deque.peekLast());
        System.out.println("Remove first: " + deque.pollFirst());
        System.out.println("Remove last: " + deque.pollLast());
        System.out.println("Remaining: " + deque);

        // Using Deque as a Stack (LIFO)
        System.out.println("\n═══ Deque as Stack ═══");
        Deque<String> stack = new ArrayDeque<>();
        stack.push("Page 1"); // push = addFirst
        stack.push("Page 2");
        stack.push("Page 3");

        System.out.println("Stack: " + stack);
        System.out.println("Back button (pop): " + stack.pop()); // Page 3
        System.out.println("Back button (pop): " + stack.pop()); // Page 2
    }
}
```

---

## Complete Project: Student Grade Analyzer

```java
// File: StudentGradeAnalyzer.java
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

class StudentRecord {
    String name;
    String department;
    Map<String, Integer> subjectMarks;

    StudentRecord(String name, String department, Map<String, Integer> subjectMarks) {
        this.name = name;
        this.department = department;
        this.subjectMarks = subjectMarks;
    }

    double getAverage() {
        return subjectMarks.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);
    }

    int getTotal() {
        return subjectMarks.values().stream().mapToInt(Integer::intValue).sum();
    }

    String getGrade() {
        double avg = getAverage();
        if (avg >= 90) return "A+";
        if (avg >= 80) return "A";
        if (avg >= 70) return "B";
        if (avg >= 60) return "C";
        if (avg >= 50) return "D";
        return "F";
    }

    @Override
    public String toString() {
        return String.format("%-15s %-12s Avg: %.1f  Grade: %s", 
                           name, department, getAverage(), getGrade());
    }
}

public class StudentGradeAnalyzer {
    public static void main(String[] args) {
        // Create students using functional approach
        List<StudentRecord> students = Arrays.asList(
            new StudentRecord("Amit", "CS", Map.of("Math", 95, "Java", 88, "DB", 92)),
            new StudentRecord("Priya", "CS", Map.of("Math", 78, "Java", 95, "DB", 85)),
            new StudentRecord("Karan", "ECE", Map.of("Math", 65, "Java", 72, "DB", 68)),
            new StudentRecord("Sneha", "CS", Map.of("Math", 88, "Java", 90, "DB", 86)),
            new StudentRecord("Rahul", "ECE", Map.of("Math", 45, "Java", 55, "DB", 50)),
            new StudentRecord("Ananya", "ME", Map.of("Math", 92, "Java", 80, "DB", 88))
        );

        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("              STUDENT GRADE ANALYZER                   ");
        System.out.println("═══════════════════════════════════════════════════════");

        // 1. Print all students using Consumer
        Consumer<StudentRecord> printStudent = s -> System.out.println("  " + s);
        students.forEach(printStudent);

        System.out.println();

        // 2. Filter students using Predicate
        Predicate<StudentRecord> isDistinction = s -> s.getAverage() >= 80;
        Predicate<StudentRecord> isCSStudent = s -> "CS".equals(s.department);

        System.out.println("🏆 CS students with distinction:");
        students.stream()
                .filter(isCSStudent.and(isDistinction))
                .forEach(printStudent);

        System.out.println();

        // 3. Transform using Function
        Function<StudentRecord, String> toSummary = s -> 
            s.name + " (" + s.getGrade() + ") — Total: " + s.getTotal();

        System.out.println("📋 Summary:");
        students.stream()
                .map(toSummary)
                .forEach(s -> System.out.println("  " + s));

        System.out.println();

        // 4. Department-wise grouping
        Map<String, List<StudentRecord>> byDept = students.stream()
                .collect(Collectors.groupingBy(s -> s.department));

        System.out.println("🏫 Department-wise:");
        byDept.forEach((dept, studs) -> {
            double deptAvg = studs.stream().mapToDouble(StudentRecord::getAverage).average().orElse(0);
            System.out.printf("  %s: %d students, Avg: %.1f%n", dept, studs.size(), deptAvg);
        });

        System.out.println();

        // 5. Sorted by average (descending) — Rank list
        System.out.println("📊 Rank List:");
        students.stream()
                .sorted(Comparator.comparingDouble(StudentRecord::getAverage).reversed())
                .forEach(s -> System.out.printf("  %-15s Avg: %.1f  Grade: %s%n", 
                                               s.name, s.getAverage(), s.getGrade()));

        System.out.println();

        // 6. Statistics
        DoubleSummaryStatistics stats = students.stream()
                .mapToDouble(StudentRecord::getAverage)
                .summaryStatistics();

        System.out.println("📈 Statistics:");
        System.out.printf("  Highest Average: %.1f%n", stats.getMax());
        System.out.printf("  Lowest Average:  %.1f%n", stats.getMin());
        System.out.printf("  Class Average:   %.1f%n", stats.getAverage());
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between a Lambda expression and an Anonymous Inner Class?**

**A:**

| Feature              | Lambda                                                        | Anonymous Inner Class                      |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| **Type**             | Works only with **functional interfaces** (1 abstract method) | Works with any interface or abstract class |
| **`this`**           | Refers to the **enclosing class**                             | Refers to the **anonymous class itself**   |
| **State**            | Cannot have fields                                            | Can have fields                            |
| **Compilation**      | Compiled using `invokedynamic` (efficient)                    | Generates a separate `.class` file         |
| **Performance**      | Better (no class loading overhead)                            | Slightly worse                             |
| **Multiple methods** | Cannot implement multiple methods                             | Can override multiple methods              |

---

**Q2: What's the difference between `ArrayList` and `LinkedList`? When would you choose each?**

**A:**

| Aspect                       | ArrayList                  | LinkedList                              |
| ---------------------------- | -------------------------- | --------------------------------------- |
| **Storage**                  | Dynamic array              | Doubly linked list                      |
| **Random access** (`get(i)`) | O(1) — direct index        | O(n) — must traverse                    |
| **Insert/Delete at start**   | O(n) — shift all elements  | O(1) — change pointers                  |
| **Insert/Delete at end**     | Amortized O(1)             | O(1)                                    |
| **Memory**                   | Less (no node overhead)    | More (each node has prev/next pointers) |
| **Cache locality**           | Better (contiguous memory) | Worse (scattered memory)                |

**Choose ArrayList** (90% of cases): General purpose, random access, iteration.
**Choose LinkedList**: Frequent inserts/deletes at the beginning, implementing queues/deques.

---

**Q3: Why can't lambda expressions use non-final local variables?**

**A:** Lambdas capture local variables by value (a copy), not by reference. If the original variable changes after the lambda captures it, the lambda would hold a stale copy — leading to confusion. Java prevents this by requiring captured variables to be **effectively final** (assigned only once).

```java
int count = 0;
// COMPILE ERROR: count is modified, so it's not effectively final
// list.forEach(item -> count++);

// Workaround: use AtomicInteger (it's a reference, not a value)
AtomicInteger atomicCount = new AtomicInteger(0);
list.forEach(item -> atomicCount.incrementAndGet()); // Works!
```

---

### Medium-Hard Questions

**Q4: Explain the internal working of `HashSet`. How does it ensure uniqueness?**

**A:** `HashSet` is internally backed by a `HashMap`! When you call `set.add(element)`:

1. It calls `element.hashCode()` to get the hash code
2. The hash is used to find the bucket index in the internal array
3. If the bucket is empty, the element is stored (as the KEY of the internal HashMap, with a dummy `PRESENT` object as the value)
4. If the bucket has elements (hash collision), it calls `element.equals(existingElement)` for each
5. If `equals()` returns `true` for any, the element is a duplicate and is NOT added (returns `false`)
6. If `equals()` returns `false` for all, the element is added to the bucket's chain

This is why **both `hashCode()` and `equals()` must be properly overridden** when using custom objects in a `HashSet`. If two equal objects have different hash codes, the Set won't detect the duplicate!

---

**Q5: What is the difference between `Comparator` and `Comparable`?**

**A:**

| Aspect                 | `Comparable`                 | `Comparator`                           |
| ---------------------- | ---------------------------- | -------------------------------------- |
| **Package**            | `java.lang`                  | `java.util`                            |
| **Method**             | `compareTo(T o)`             | `compare(T o1, T o2)`                  |
| **Where implemented**  | IN the class itself          | OUTSIDE, in a separate class or lambda |
| **Number**             | Only ONE natural ordering    | MULTIPLE orderings possible            |
| **Modification**       | Requires modifying the class | No modification needed                 |
| **Collections.sort()** | `sort(list)`                 | `sort(list, comparator)`               |

**Rule of thumb:** Use `Comparable` for the primary, natural sorting of a class (e.g., students by roll number). Use `Comparator` for alternative sortings (by name, by GPA, by age).

```java
class Employee implements Comparable<Employee> {
    String name;
    double salary;

    @Override
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary); // Natural: by salary
    }
}

// Alternative orderings with Comparator
Comparator<Employee> byName = Comparator.comparing(e -> e.name);
Comparator<Employee> bySalaryDesc = Comparator.comparingDouble(e -> e.salary).reversed();
```

---

**Q6: What's the output of this code? Explain.**

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", 1);
map.put("B", 2);
map.put("C", 3);

for (String key : map.keySet()) {
    if (key.equals("B")) {
        map.remove(key);
    }
}
System.out.println(map);
```

**A:** This throws `ConcurrentModificationException`! You cannot modify a collection while iterating over it with a for-each loop. The iterator detects the structural modification and throws the exception.

**Solutions:**

```java
// Solution 1: Use Iterator.remove()
Iterator<String> it = map.keySet().iterator();
while (it.hasNext()) {
    if (it.next().equals("B")) it.remove();
}

// Solution 2: Use removeIf()
map.keySet().removeIf(key -> key.equals("B"));

// Solution 3: Collect keys to remove first
List<String> toRemove = map.keySet().stream()
    .filter(k -> k.equals("B")).collect(Collectors.toList());
toRemove.forEach(map::remove);
```

---

> 🎯 **Session 3 Summary:** You've learned how Lambda expressions bring functional programming to Java, how functional interfaces provide the contracts for lambdas, how to use built-in interfaces like `Predicate`, `Function`, and `Consumer`, and explored the Java Collections Framework — Lists, Sets, Maps, and Queues. This foundation powers the Streams API in the next session!
