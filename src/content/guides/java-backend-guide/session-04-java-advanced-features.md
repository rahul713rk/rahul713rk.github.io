---
title: "Session 4: Java Advanced Features — Generics, Streams API, HashMap & Hashing"
description: "Step 4 of Java Backend Guide: Session 4: Java Advanced Features — Generics, Streams API, HashMap & Hashing."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 4
---

---

## Table of Contents

1. [Generics in Java](#generics-in-java)
2. [Bounded Type Parameters & Wildcards](#bounded-type-parameters--wildcards)
3. [Streams API](#streams-api)
4. [HashMap & Hashing Algorithms](#hashmap--hashing-algorithms)
5. [Sequential vs Parallel Streams](#sequential-vs-parallel-streams)
6. [Complete Project: E-Commerce Analytics Engine](#complete-project-e-commerce-analytics-engine)
7. [Interview Questions & Answers](#interview-questions--answers)

---

## Generics in Java

> 🧰 **Story: The Universal Toolbox**
> 
> Imagine a toolbox factory. Initially, they made separate toolboxes for each tool type: one for screwdrivers, one for hammers, one for wrenches. Each toolbox was hardcoded. This was wasteful — the design was the SAME, only the contents differed.
> 
> One day, the factory owner said: "Let's make ONE universal toolbox design with a label slot. The buyer writes on the label what goes inside (screwdrivers, hammers, etc.), and the toolbox only accepts THAT type." This is **Generics** — writing ONE class/method that works with ANY type, while keeping type safety.
> 
> Without generics, Java used `Object` everywhere, and you had to cast types manually — leading to `ClassCastException` at runtime. With generics, the compiler catches type mismatches AT COMPILE TIME.

### Before vs After Generics

```java
// File: GenericsIntro.java
import java.util.*;

public class GenericsIntro {
    public static void main(String[] args) {

        // ========= BEFORE GENERICS (Java 4 and earlier) =========
        List oldList = new ArrayList(); // Raw type — accepts ANYTHING
        oldList.add("Hello");
        oldList.add(42);           // No compile error — but this is a problem!
        oldList.add(true);

        // Must cast, and it can CRASH at runtime!
        // String s = (String) oldList.get(1); // ClassCastException! 42 is not String

        // ========= WITH GENERICS (Java 5+) =========
        List<String> safeList = new ArrayList<>(); // Only Strings allowed!
        safeList.add("Hello");
        // safeList.add(42);       // COMPILE ERROR! Catches bug early
        // safeList.add(true);     // COMPILE ERROR!

        String s = safeList.get(0); // No casting needed!
        System.out.println(s);
    }
}
```

### Creating Generic Classes

```java
// File: GenericClassDemo.java

// Generic class — 'T' is a type parameter (placeholder for any type)
class Box<T> {
    private T content;

    public Box(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }

    public void setContent(T content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "Box[" + content + "]";
    }
}

// Multiple type parameters
class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }

    @Override
    public String toString() {
        return key + " → " + value;
    }
}

// Generic class for API Responses
class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private long timestamp;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    public T getData() { return data; }

    @Override
    public String toString() {
        return String.format("{success: %s, message: '%s', data: %s}", 
                           success, message, data);
    }
}

public class GenericClassDemo {
    public static void main(String[] args) {
        // Box can hold ANY type
        Box<String> stringBox = new Box<>("Hello World");
        Box<Integer> intBox = new Box<>(42);
        Box<Double> doubleBox = new Box<>(3.14);

        System.out.println(stringBox);
        System.out.println(intBox);
        System.out.println(doubleBox);

        String value = stringBox.getContent(); // No casting — type-safe!
        System.out.println("Unboxed: " + value);

        System.out.println();

        // Pair with different types for key and value
        Pair<String, Integer> nameAge = new Pair<>("Amit", 25);
        Pair<Integer, String> idName = new Pair<>(101, "Order-ABC");

        System.out.println(nameAge);
        System.out.println(idName);

        System.out.println();

        // ApiResponse with different data types
        ApiResponse<String> loginResponse = new ApiResponse<>(true, "Login successful", "token-abc-123");
        ApiResponse<List<String>> usersResponse = new ApiResponse<>(true, "Users fetched", 
            List.of("Amit", "Priya", "Karan"));
        ApiResponse<Integer> countResponse = new ApiResponse<>(true, "Count", 42);

        System.out.println(loginResponse);
        System.out.println(usersResponse);
        System.out.println(countResponse);
    }
}
```

### Generic Methods

```java
// File: GenericMethodDemo.java
import java.util.*;

public class GenericMethodDemo {

    // Generic method — type parameter <T> before return type
    public static <T> void printArray(T[] array) {
        System.out.print("[");
        for (int i = 0; i < array.length; i++) {
            System.out.print(array[i]);
            if (i < array.length - 1) System.out.print(", ");
        }
        System.out.println("]");
    }

    // Generic method with return type
    public static <T> T getFirst(List<T> list) {
        if (list == null || list.isEmpty()) return null;
        return list.get(0);
    }

    // Generic method with multiple type parameters
    public static <K, V> Map<K, V> zipToMap(List<K> keys, List<V> values) {
        Map<K, V> map = new LinkedHashMap<>();
        int size = Math.min(keys.size(), values.size());
        for (int i = 0; i < size; i++) {
            map.put(keys.get(i), values.get(i));
        }
        return map;
    }

    public static void main(String[] args) {
        // Same method works with different array types
        Integer[] intArr = {1, 2, 3, 4, 5};
        String[] strArr = {"Hello", "World"};
        Double[] dblArr = {1.1, 2.2, 3.3};

        printArray(intArr);
        printArray(strArr);
        printArray(dblArr);

        System.out.println();

        System.out.println("First string: " + getFirst(List.of("Apple", "Banana")));
        System.out.println("First number: " + getFirst(List.of(10, 20, 30)));

        System.out.println();

        // Zip two lists into a map
        List<String> names = List.of("Amit", "Priya", "Karan");
        List<Integer> scores = List.of(95, 88, 72);
        Map<String, Integer> nameScores = zipToMap(names, scores);
        System.out.println("Zipped: " + nameScores);
    }
}
```

---

## Bounded Type Parameters & Wildcards

> 🎟️ **Story: The VIP Section**
> 
> A club has three sections:
> 
> - **General area** (`<T>`) — anyone can enter
> - **VIP area** (`<T extends VIP>`) — only VIP members and VIP sub-types (Diamond VIP, Gold VIP) can enter. This is an **upper bound**.
> - **Anyone above regular** (`<? super Regular>`) — Regular members and any higher tier (VIP, Admin) can enter. This is a **lower bound**.

```java
// File: BoundsAndWildcardsDemo.java
import java.util.*;

public class BoundsAndWildcardsDemo {

    // ========= UPPER BOUND: <T extends Number> =========
    // T must be Number or a subclass (Integer, Double, etc.)
    public static <T extends Number> double sum(List<T> numbers) {
        double total = 0;
        for (T num : numbers) {
            total += num.doubleValue(); // Can call Number methods!
        }
        return total;
    }

    // Multiple bounds: T must extend Comparable AND Serializable
    public static <T extends Comparable<T>> T findMax(List<T> list) {
        T max = list.get(0);
        for (T item : list) {
            if (item.compareTo(max) > 0) max = item;
        }
        return max;
    }

    // ========= WILDCARDS =========

    // Upper bounded wildcard: <? extends Number> — READ only
    public static double total(List<? extends Number> numbers) {
        double sum = 0;
        for (Number n : numbers) {
            sum += n.doubleValue();
        }
        // numbers.add(42); // COMPILE ERROR! Can't add to <? extends ...>
        return sum;
    }

    // Lower bounded wildcard: <? super Integer> — WRITE only
    public static void addIntegers(List<? super Integer> list) {
        list.add(10);
        list.add(20);
        list.add(30);
        // Integer x = list.get(0); // COMPILE ERROR! Can't guarantee type on read
    }

    // Unbounded wildcard: <?> — read as Object only
    public static void printList(List<?> list) {
        for (Object item : list) {
            System.out.print(item + " ");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // Upper bounded type parameter
        List<Integer> ints = List.of(1, 2, 3, 4, 5);
        List<Double> doubles = List.of(1.5, 2.5, 3.5);

        System.out.println("Sum of ints: " + sum(ints));
        System.out.println("Sum of doubles: " + sum(doubles));
        System.out.println("Max int: " + findMax(ints));
        System.out.println("Max string: " + findMax(List.of("Banana", "Apple", "Cherry")));

        System.out.println();

        // Wildcards
        System.out.println("Total (ints): " + total(ints));
        System.out.println("Total (doubles): " + total(doubles));

        List<Number> numList = new ArrayList<>();
        addIntegers(numList); // Works because Number is a super type of Integer
        System.out.println("After adding: " + numList);

        // Unbounded wildcard
        System.out.print("Ints: "); printList(ints);
        System.out.print("Doubles: "); printList(doubles);
        System.out.print("Strings: "); printList(List.of("A", "B", "C"));
    }
}
```

**PECS Rule (Producer Extends, Consumer Super):**

- Use `<? extends T>` when you only READ from the list (it **produces** elements)
- Use `<? super T>` when you only WRITE to the list (it **consumes** elements)
- Use `<T>` when you both read AND write

---

## Streams API

> 🏭 **Story: The Assembly Line**
> 
> Imagine a car manufacturing factory with an assembly line:
> 
> 1. **Raw materials come in** (data source — List, Array, etc.)
> 2. They pass through **stations** that filter, transform, sort (intermediate operations)
> 3. At the **end**, a finished car comes out (terminal operation — collect, count, forEach)
> 
> The assembly line doesn't store cars — it processes them as they flow through. Each station takes an input, does ONE thing, and passes the result to the next station. This is the **Streams API**.

### Stream Pipeline

```
Source → filter() → map() → sorted() → collect()  
  │        │          │         │          │
  │    Intermediate  Intermediate  Intermediate  Terminal
  │    (lazy)       (lazy)        (lazy)        (triggers execution)
```

```java
// File: StreamsAPIDemo.java
import java.util.*;
import java.util.stream.*;

public class StreamsAPIDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList(
            "Amit", "Priya", "Karan", "Sneha", "Rahul", 
            "Ananya", "Kiran", "Pooja", "Arjun", "Neha"
        );

        // ===== INTERMEDIATE OPERATIONS (lazy — return a Stream) =====

        // filter(): Keep elements matching a condition
        System.out.println("Names starting with 'A':");
        names.stream()
             .filter(name -> name.startsWith("A"))
             .forEach(name -> System.out.print(name + " "));
        System.out.println();

        // map(): Transform each element
        System.out.println("\nUppercase names:");
        names.stream()
             .map(String::toUpperCase)
             .forEach(name -> System.out.print(name + " "));
        System.out.println();

        // sorted(): Sort elements
        System.out.println("\nSorted by length:");
        names.stream()
             .sorted(Comparator.comparingInt(String::length))
             .forEach(name -> System.out.print(name + " "));
        System.out.println();

        // distinct(): Remove duplicates
        List<Integer> nums = Arrays.asList(1, 2, 3, 2, 1, 4, 5, 3);
        System.out.println("\nDistinct numbers: " + 
            nums.stream().distinct().collect(Collectors.toList()));

        // limit() & skip(): Pagination
        System.out.println("First 3 names: " + 
            names.stream().limit(3).collect(Collectors.toList()));
        System.out.println("Skip 7, take rest: " + 
            names.stream().skip(7).collect(Collectors.toList()));

        // peek(): Debug/inspect (for side effects)
        System.out.println();
        long count = names.stream()
            .peek(n -> System.out.print("[peek: " + n + "] "))
            .filter(n -> n.length() > 4)
            .count();
        System.out.println("\nNames with length > 4: " + count);

        // flatMap(): Flatten nested structures
        List<List<Integer>> nestedNumbers = List.of(
            List.of(1, 2, 3), 
            List.of(4, 5), 
            List.of(6, 7, 8, 9)
        );
        List<Integer> flat = nestedNumbers.stream()
            .flatMap(Collection::stream) // Flatten List<List<Integer>> → Stream<Integer>
            .collect(Collectors.toList());
        System.out.println("\nFlattened: " + flat);

        System.out.println("\n===== TERMINAL OPERATIONS =====\n");

        // collect(): Gather results
        List<String> shortNames = names.stream()
            .filter(n -> n.length() <= 4)
            .collect(Collectors.toList());
        System.out.println("Short names: " + shortNames);

        // joining: Concatenate strings
        String joined = names.stream()
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("Joined: " + joined);

        // toMap: Create a Map
        Map<String, Integer> nameLengths = names.stream()
            .collect(Collectors.toMap(n -> n, String::length));
        System.out.println("Name lengths: " + nameLengths);

        // reduce(): Combine all elements into one
        List<Integer> numbers = List.of(1, 2, 3, 4, 5);
        int sum = numbers.stream().reduce(0, Integer::sum);
        int product = numbers.stream().reduce(1, (a, b) -> a * b);
        System.out.println("\nSum: " + sum + ", Product: " + product);

        // Chaining it all together — readable pipeline
        System.out.println("\n===== CHAINED PIPELINE =====\n");
        String result = names.stream()
            .filter(n -> n.length() > 4)          // Step 1: Filter
            .map(String::toUpperCase)              // Step 2: Transform
            .sorted()                              // Step 3: Sort
            .collect(Collectors.joining(" | "));   // Step 4: Collect
        System.out.println("Result: " + result);
    }
}
```

---

## HashMap & Hashing Algorithms

> 🗄️ **Story: The Library Card Catalog**
> 
> Before computers, libraries used a **card catalog** — a cabinet with many drawers. Each drawer was labeled with a range of letters (A-C, D-F, etc.). When you wanted to find a book by "Java Programming," you'd look at the first letter 'J', go to the right drawer, and search ONLY in that drawer instead of all 10,000 cards.
> 
> `HashMap` works the same way:
> 
> 1. A **hash function** converts the key into a drawer number (bucket index)
> 2. You search ONLY in that specific bucket
> 3. This makes lookups **O(1)** average instead of **O(n)**

### Internal Structure of HashMap

```
HashMap<String, Integer> Internal Structure (Java 8+):

    Array of Buckets (size = 16 by default)
    ┌─────────────────────────────────────────────┐
    │ [0] → null                                   │
    │ [1] → Node("Amit", 25) → null               │
    │ [2] → null                                   │
    │ [3] → Node("Priya", 23) → Node("Karan", 28) │ ← Hash collision!
    │ [4] → null                                   │
    │ [5] → Node("Sneha", 22) → null              │
    │ ...                                          │
    │ [15] → null                                  │
    └─────────────────────────────────────────────┘

    When bucket has > 8 entries (treeify threshold), 
    the linked list converts to a RED-BLACK TREE for O(log n) lookup
```

```java
// File: HashMapInternals.java
import java.util.*;

public class HashMapInternals {
    public static void main(String[] args) {

        // ===== How hash code & bucket index work =====
        String key = "Amit";
        int hashCode = key.hashCode();
        int bucketIndex = hashCode & 15; // 15 = capacity(16) - 1

        System.out.println("Key: " + key);
        System.out.println("hashCode(): " + hashCode);
        System.out.println("Bucket index (cap=16): " + bucketIndex);

        System.out.println();

        // ===== Basic HashMap Operations =====
        Map<String, Integer> studentMarks = new HashMap<>();

        // PUT: compute hash → find bucket → add entry
        studentMarks.put("Amit", 95);
        studentMarks.put("Priya", 88);
        studentMarks.put("Karan", 72);
        studentMarks.put("Sneha", 91);

        // GET: compute hash → find bucket → find entry by equals()
        System.out.println("Amit's marks: " + studentMarks.get("Amit"));

        // Useful methods
        System.out.println("Contains 'Priya'? " + studentMarks.containsKey("Priya"));
        System.out.println("Contains value 72? " + studentMarks.containsValue(72));
        System.out.println("Default for missing: " + studentMarks.getOrDefault("Unknown", -1));

        // putIfAbsent — don't overwrite existing
        studentMarks.putIfAbsent("Amit", 50); // Won't change — "Amit" already exists
        System.out.println("Amit after putIfAbsent: " + studentMarks.get("Amit")); // Still 95

        // compute — transform existing value
        studentMarks.compute("Karan", (key2, val) -> val + 10); // Add bonus marks
        System.out.println("Karan after bonus: " + studentMarks.get("Karan"));

        // merge — combine old and new values
        studentMarks.merge("Priya", 5, Integer::sum); // Add 5 extra marks
        System.out.println("Priya after merge: " + studentMarks.get("Priya"));

        System.out.println();

        // ===== HashMap with Custom Objects =====
        System.out.println("=== Custom Object as Key ===");
        Map<Student, String> studentDept = new HashMap<>();
        studentDept.put(new Student(1, "Amit"), "Computer Science");
        studentDept.put(new Student(2, "Priya"), "Electronics");

        // This ONLY works if hashCode() and equals() are overridden!
        Student searchKey = new Student(1, "Amit");
        System.out.println("Found: " + studentDept.get(searchKey));
    }
}

class Student {
    int id;
    String name;

    Student(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // MUST override hashCode and equals for HashMap to work correctly!
    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Student)) return false;
        Student other = (Student) obj;
        return this.id == other.id && Objects.equals(this.name, other.name);
    }
}
```

### Hashing Deep Dive

```java
// File: HashingDemo.java
import java.util.*;

public class HashingDemo {
    public static void main(String[] args) {

        // ===== How Java computes hash codes =====
        // String hash code: s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
        String s1 = "Amit";
        System.out.println("'Amit'.hashCode() = " + s1.hashCode());

        // Manual calculation for verification
        int manual = 'A'*31*31*31 + 'm'*31*31 + 'i'*31 + 't';
        System.out.println("Manual calculation = " + manual);

        System.out.println();

        // ===== Hash Collisions Demonstration =====
        // These two strings generate the SAME hash code
        System.out.println("'Aa'.hashCode() = " + "Aa".hashCode());
        System.out.println("'BB'.hashCode() = " + "BB".hashCode());
        System.out.println("Collision? " + ("Aa".hashCode() == "BB".hashCode()));

        System.out.println();

        // ===== HashMap internal hash spreading =====
        // Java HashMap doesn't use hashCode() directly
        // It spreads high bits to low bits: hash = hashCode ^ (hashCode >>> 16)
        int h = "Amit".hashCode();
        int spread = h ^ (h >>> 16);
        System.out.println("Original hash:  " + Integer.toBinaryString(h));
        System.out.println("Spread hash:    " + Integer.toBinaryString(spread));
        System.out.println("Bucket (cap=16): " + (spread & 15));

        System.out.println();

        // ===== Load Factor and Rehashing =====
        System.out.println("=== Load Factor Demo ===");
        // Default: capacity=16, loadFactor=0.75
        // Rehash when size > 16 * 0.75 = 12 entries
        Map<Integer, String> map = new HashMap<>(4, 0.75f); // Small capacity for demo

        for (int i = 0; i < 10; i++) {
            map.put(i, "Value-" + i);
            // Internally, HashMap doubles capacity when threshold is exceeded:
            // 4→8→16→... Each resize rehashes ALL entries to new bucket positions
        }
        System.out.println("Map size: " + map.size());
        System.out.println("Entries: " + map);

        // ===== The hashCode/equals Contract =====
        // Rule 1: If equals() returns true, hashCode() MUST return the same value
        // Rule 2: If hashCode() returns the same value, equals() MAY return false (collision)
        // Rule 3: If equals() returns false, hashCode() can be anything
    }
}
```

---

## Sequential vs Parallel Streams

> 🚗 **Story: The Highway**
> 
> Imagine a toll plaza with ONE lane (sequential stream) — each car is processed one by one. Now imagine the plaza opens 4 lanes (parallel stream) — 4 cars are processed simultaneously. The total throughput increases, but there's overhead in managing multiple lanes (thread coordination).
> 
> - **Sequential Stream**: One thread processes all elements in order. Simple, predictable.
> - **Parallel Stream**: Uses the ForkJoinPool to split work across multiple CPU cores. Faster for large datasets but has overhead and ordering issues.

```java
// File: SequentialVsParallelDemo.java
import java.util.*;
import java.util.stream.*;

public class SequentialVsParallelDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>();
        for (int i = 1; i <= 10_000_000; i++) numbers.add(i);

        // ===== Sequential Stream =====
        long start = System.currentTimeMillis();
        long seqSum = numbers.stream()
            .filter(n -> n % 2 == 0)
            .mapToLong(n -> n)
            .sum();
        long seqTime = System.currentTimeMillis() - start;
        System.out.println("Sequential sum: " + seqSum + " | Time: " + seqTime + "ms");

        // ===== Parallel Stream =====
        start = System.currentTimeMillis();
        long parSum = numbers.parallelStream()
            .filter(n -> n % 2 == 0)
            .mapToLong(n -> n)
            .sum();
        long parTime = System.currentTimeMillis() - start;
        System.out.println("Parallel sum:   " + parSum + " | Time: " + parTime + "ms");

        System.out.println("\nResults match? " + (seqSum == parSum));
        System.out.println("Speedup: " + String.format("%.2fx", (double)seqTime / parTime));

        // ===== CAUTION: Order matters! =====
        System.out.println("\n--- Order Demonstration ---");
        List<String> names = List.of("Alice", "Bob", "Charlie", "Diana", "Eve");

        System.out.print("Sequential: ");
        names.stream().forEach(n -> System.out.print(n + " "));
        System.out.println();

        System.out.print("Parallel:   ");
        names.parallelStream().forEach(n -> System.out.print(n + " ")); // Order NOT guaranteed!
        System.out.println();

        System.out.print("ForEachOrdered: ");
        names.parallelStream().forEachOrdered(n -> System.out.print(n + " ")); // Order guaranteed
        System.out.println();

        // ===== CAUTION: Thread safety with shared state =====
        System.out.println("\n--- Thread Safety Issue ---");
        List<Integer> unsafeList = new ArrayList<>(); // Not thread-safe!

        // DO NOT do this — will give wrong results or throw exceptions
        // IntStream.range(0, 1000).parallel().forEach(i -> unsafeList.add(i));

        // CORRECT: Use collect() instead of shared mutable state
        List<Integer> safeList = IntStream.range(0, 1000)
            .parallel()
            .boxed()
            .collect(Collectors.toList());
        System.out.println("Safe parallel collect size: " + safeList.size()); // Always 1000
    }
}
```

**When to Use Parallel Streams:**
| Use Parallel When | Avoid Parallel When |
|---|---|
| Large datasets (100K+ elements) | Small datasets |
| Stateless, independent operations | Shared mutable state |
| CPU-intensive transformations | I/O-bound operations |
| No ordering requirement | Order matters |
| ArrayList (good splittable source) | LinkedList (poor splitting) |

---

## Complete Project: E-Commerce Analytics Engine

```java
// File: ECommerceAnalytics.java
import java.util.*;
import java.util.stream.*;

class Product {
    String name;
    String category;
    double price;
    int quantity;
    double rating;

    Product(String name, String category, double price, int quantity, double rating) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
        this.rating = rating;
    }

    double getRevenue() { return price * quantity; }

    @Override
    public String toString() {
        return String.format("%-20s %-12s ₹%-8.0f Qty:%-4d ⭐%.1f", 
                           name, category, price, quantity, rating);
    }
}

// Generic Result Wrapper
class AnalyticsResult<T> {
    String metricName;
    T value;

    AnalyticsResult(String metricName, T value) {
        this.metricName = metricName;
        this.value = value;
    }

    @Override
    public String toString() {
        return String.format("📊 %-30s : %s", metricName, value);
    }
}

public class ECommerceAnalytics {

    static List<Product> getProducts() {
        return List.of(
            new Product("iPhone 15", "Electronics", 79999, 150, 4.5),
            new Product("Samsung S24", "Electronics", 69999, 200, 4.3),
            new Product("MacBook Pro", "Electronics", 149999, 80, 4.8),
            new Product("Running Shoes", "Sports", 4999, 500, 4.2),
            new Product("Yoga Mat", "Sports", 1299, 300, 4.0),
            new Product("Cricket Bat", "Sports", 2999, 250, 4.6),
            new Product("Java Book", "Books", 599, 1000, 4.7),
            new Product("DSA Guide", "Books", 499, 800, 4.4),
            new Product("Spring Boot Pro", "Books", 899, 600, 4.5),
            new Product("T-Shirt", "Fashion", 799, 2000, 3.8),
            new Product("Jeans", "Fashion", 1999, 1500, 4.1),
            new Product("Headphones", "Electronics", 2999, 400, 4.3)
        );
    }

    public static void main(String[] args) {
        List<Product> products = getProducts();

        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("            E-COMMERCE ANALYTICS ENGINE                        ");
        System.out.println("═══════════════════════════════════════════════════════════════");

        // 1. All products
        System.out.println("\n📦 All Products:");
        products.forEach(p -> System.out.println("  " + p));

        // 2. Revenue by category (Streams + Collectors.groupingBy)
        System.out.println("\n💰 Revenue by Category:");
        Map<String, Double> revenueByCategory = products.stream()
            .collect(Collectors.groupingBy(
                p -> p.category,
                Collectors.summingDouble(Product::getRevenue)
            ));
        revenueByCategory.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .forEach(e -> System.out.printf("  %-12s : ₹%,.0f%n", e.getKey(), e.getValue()));

        // 3. Top 3 products by revenue
        System.out.println("\n🏆 Top 3 Products by Revenue:");
        products.stream()
            .sorted(Comparator.comparingDouble(Product::getRevenue).reversed())
            .limit(3)
            .forEach(p -> System.out.printf("  %-20s ₹%,.0f%n", p.name, p.getRevenue()));

        // 4. Average rating by category
        System.out.println("\n⭐ Average Rating by Category:");
        products.stream()
            .collect(Collectors.groupingBy(p -> p.category, Collectors.averagingDouble(p -> p.rating)))
            .forEach((cat, avg) -> System.out.printf("  %-12s : %.2f ⭐%n", cat, avg));

        // 5. Products with rating > 4.5 (filter)
        System.out.println("\n🌟 Premium Products (Rating > 4.5):");
        products.stream()
            .filter(p -> p.rating > 4.5)
            .forEach(p -> System.out.println("  " + p.name + " (" + p.rating + "⭐)"));

        // 6. Generic Analytics Results
        System.out.println("\n" + new AnalyticsResult<>("Total Products", products.size()));

        double totalRevenue = products.stream().mapToDouble(Product::getRevenue).sum();
        System.out.println(new AnalyticsResult<>("Total Revenue", String.format("₹%,.0f", totalRevenue)));

        String bestSeller = products.stream()
            .max(Comparator.comparingInt(p -> p.quantity))
            .map(p -> p.name).orElse("N/A");
        System.out.println(new AnalyticsResult<>("Best Seller (by qty)", bestSeller));

        long premiumCount = products.stream().filter(p -> p.price > 10000).count();
        System.out.println(new AnalyticsResult<>("Premium Products (>₹10K)", premiumCount));

        // 7. Partition: cheap vs expensive
        System.out.println("\n📊 Price Partition (₹5000 threshold):");
        Map<Boolean, List<Product>> partition = products.stream()
            .collect(Collectors.partitioningBy(p -> p.price >= 5000));
        System.out.println("  Expensive (" + partition.get(true).size() + "): " +
            partition.get(true).stream().map(p -> p.name).collect(Collectors.joining(", ")));
        System.out.println("  Affordable (" + partition.get(false).size() + "): " +
            partition.get(false).stream().map(p -> p.name).collect(Collectors.joining(", ")));

        // 8. Category product names map
        System.out.println("\n🗂️ Products by Category:");
        products.stream()
            .collect(Collectors.groupingBy(p -> p.category, 
                     Collectors.mapping(p -> p.name, Collectors.toList())))
            .forEach((cat, names) -> System.out.println("  " + cat + ": " + names));
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is type erasure in Java Generics?**

**A:** Type erasure is the process where the compiler removes all generic type information at compile time and replaces type parameters with their bounds (or `Object` if unbounded). This means generics exist ONLY at compile time for type checking — at runtime, all generic types are erased.

```java
// At compile time:        // At runtime (after erasure):
List<String> list;         List list;
Box<Integer> box;          Box box;
Pair<String, Integer> p;   Pair p;
```

Consequences:

- Cannot do `new T()` or `new T[]` (type unknown at runtime)
- Cannot do `instanceof List<String>` (type erased)
- `List<String>` and `List<Integer>` are the SAME class at runtime
- Cannot overload methods that differ only by generic type

---

**Q2: What's the difference between `map()` and `flatMap()` in Streams?**

**A:** `map()` applies a function to each element and wraps the result. If the function returns a Stream, you get a `Stream<Stream<T>>`. `flatMap()` applies a function that returns a Stream, then flattens all the inner streams into one.

```java
// map(): one-to-one transformation
// ["Hello", "World"] → [5, 5]  (each string → its length)
list.stream().map(String::length)

// flatMap(): one-to-many transformation + flattening
// [["H","e","l","l","o"], ["W","o","r","l","d"]] → ["H","e","l","l","o","W","o","r","l","d"]
list.stream().flatMap(s -> Arrays.stream(s.split("")))
```

Real-world example: Each user has a list of orders. To get all orders from all users: `users.stream().flatMap(user -> user.getOrders().stream())`

---

**Q3: How does `HashMap.put()` work internally?**

**A:**

1. **Compute hash:** `hash = key.hashCode() ^ (key.hashCode() >>> 16)` — spreads bits
2. **Find bucket:** `index = hash & (capacity - 1)` — modulo using bitwise AND
3. **Check bucket:**
   - If empty → create a new `Node(hash, key, value)` and place it
   - If occupied → traverse the chain:
     - If a node has the same hash AND `key.equals(existingKey)` → replace the value
     - If no match → add to end of chain (LinkedList or TreeNode)
4. **Check load:** If `size > capacity * loadFactor` → resize (double capacity) and rehash all entries
5. **Treeify:** If a bucket's chain length > 8 AND total capacity ≥ 64, convert the linked list to a red-black tree (Java 8+)

---

### Medium-Hard Questions

**Q4: Why is `String` a popular key in `HashMap`? What makes it ideal?**

**A:**

1. **Immutable:** String's hash code is computed once and cached. Even if a String is used in a billion lookups, `hashCode()` is called only once. Mutable keys can change their hash code after being inserted — making them unfindable.
2. **Good hash distribution:** String uses the polynomial rolling hash `s[0]*31^(n-1) + s[1]*31^(n-2) + ...` which distributes well.
3. **String pool:** Identical string literals point to the same object, so `equals()` often short-circuits with `==`.
4. **Proper `equals()` and `hashCode()`:** These are correctly implemented, following the contract.

If you use a mutable object as a key and modify it after insertion, the entry becomes a "ghost" — it exists in a bucket determined by the OLD hash, but lookups use the NEW hash, so it's never found.

---

**Q5: What happens when multiple threads use `HashMap` concurrently?**

**A:** `HashMap` is NOT thread-safe. Concurrent access can cause:

1. **Lost updates:** Two threads put to the same bucket → one entry may be lost
2. **Infinite loop (Java 7):** During resize, linked list can form a cycle → `get()` never returns (CPU spins forever)
3. **Corrupted data:** Size counter may be wrong, entries may be in wrong buckets

Solutions:

- `Collections.synchronizedMap(map)` — coarse-grained locking (synchronized on every operation)
- `ConcurrentHashMap` — fine-grained locking (locks per segment/bucket, lock-free reads in Java 8+). This is the BEST choice for concurrent access.
- `Hashtable` — legacy, synchronized (don't use in new code)

---

**Q6: Explain how Streams' laziness works. What happens internally?**

**A:** Intermediate operations (`filter`, `map`, `sorted`) don't process data when called — they return a new Stream wrapping the pipeline. Execution only begins when a terminal operation (`collect`, `forEach`, `count`) is called.

```java
// Nothing happens here — lazy pipeline construction
Stream<String> pipeline = names.stream()
    .filter(n -> { System.out.println("Filter: " + n); return n.length() > 3; })
    .map(n -> { System.out.println("Map: " + n); return n.toUpperCase(); });

// NOW processing begins — terminal operation triggers it
pipeline.forEach(System.out::println);
```

The output shows interleaved filter+map calls — NOT all filters first, then all maps. This is called **loop fusion** — the JVM processes one element through the ENTIRE pipeline before moving to the next. Benefits: short-circuits early (e.g., `findFirst()` stops after first match), avoids intermediate collections.

---

> 🎯 **Session 4 Summary:** You've mastered Generics (type-safe reusable code), the Streams API (functional data processing pipelines), HashMap internals (hashing, buckets, collisions), and the differences between sequential and parallel streams. These tools are foundational for writing efficient, type-safe Java backend code!
