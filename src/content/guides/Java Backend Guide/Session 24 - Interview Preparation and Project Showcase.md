# Session 24: Interview Preparation & Project Showcase

---

## Table of Contents

1. [How to Prepare for Backend Interviews](#how-to-prepare)
2. [Core Java Interview Questions](#core-java)
3. [Spring Boot Interview Questions](#spring-boot)
4. [Database & SQL Interview Questions](#database--sql)
5. [Microservices Interview Questions](#microservices)
6. [System Design Interview Questions](#system-design)
7. [Behavioral & Scenario Questions](#behavioral--scenario)
8. [Coding Challenges](#coding-challenges)
9. [Resume & Portfolio Tips](#resume--portfolio-tips)
10. [Final Roadmap Recap](#final-roadmap-recap)

---

## How to Prepare for Backend Interviews

> 🏋️ **Story: The Athlete's Training Plan**
> 
> An Olympic athlete doesn't just run on race day — they train fundamentals (technique), do mock races (mock interviews), study opponents (company-specific prep), and rest strategically. Your interview prep follows the same discipline.

### Interview Structure at Most Companies

```
Round 1: Online Assessment (HackerRank/LeetCode)
    ├── DSA problems + MCQ on Java/Spring
    │
Round 2: Technical Interview 1 (Core Java + Spring)
    ├── OOP, Collections, Multithreading, Spring Boot
    │
Round 3: Technical Interview 2 (System Design + DB)
    ├── Design a system, SQL queries, optimization
    │
Round 4: Managerial / HR Round
    ├── Behavioral, project discussion, culture fit
    │
Offer! 🎉
```

---

## Core Java Interview Questions

**Q1: What is the difference between `==` and `.equals()` in Java?**

**A:** `==` compares REFERENCES (memory addresses) — are two variables pointing to the SAME object? `.equals()` compares VALUES (content) — do two objects have the same data?

```java
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);       // false (different objects in heap)
System.out.println(a.equals(b));  // true (same content)

// Special case: String Pool
String c = "hello";
String d = "hello";
System.out.println(c == d);       // true (same object in string pool!)
```

---

**Q2: Explain the `final`, `finally`, and `finalize` keywords.**

**A:**

- `final` — makes variable constant, method non-overridable, class non-extendable
- `finally` — block that ALWAYS executes after try-catch (for cleanup: close connections)
- `finalize()` — deprecated method called by GC before destroying an object (don't use it)

---

**Q3: What is the difference between `HashMap`, `TreeMap`, and `LinkedHashMap`?**

**A:**

| Feature  | HashMap    | TreeMap        | LinkedHashMap            |
| -------- | ---------- | -------------- | ------------------------ |
| Order    | No order   | Sorted by key  | Insertion order          |
| Get/Put  | O(1)       | O(log n)       | O(1)                     |
| Null key | 1 allowed  | ❌ No           | 1 allowed                |
| Internal | Hash table | Red-Black tree | Hash table + linked list |

---

**Q4: What is the difference between `Comparable` and `Comparator`?**

**A:** `Comparable` defines NATURAL ordering inside the class itself (`compareTo()`). `Comparator` defines CUSTOM ordering outside the class (`compare(a, b)`).

```java
// Comparable — class defines its own ordering
class Employee implements Comparable<Employee> {
    @Override
    public int compareTo(Employee other) {
        return this.name.compareTo(other.name); // Natural order by name
    }
}

// Comparator — external, custom ordering
Collections.sort(employees, Comparator.comparing(Employee::getSalary).reversed());
```

---

**Q5: Explain the Java Memory Model — Stack vs Heap.**

**A:**

- **Stack:** Thread-specific, stores primitive variables and references. LIFO order, auto-cleaned when method returns. Fast but limited size.
- **Heap:** Shared by all threads, stores objects. Managed by Garbage Collector. `new` keyword allocates on heap. Larger but slower.

```java
void example() {
    int x = 5;                    // x → Stack
    String name = "Hello";        // name (reference) → Stack; "Hello" (object) → Heap
    User user = new User("Amit"); // user (reference) → Stack; User object → Heap
}
```

---

**Q6: What are the different types of Garbage Collectors in Java?**

**A:**

- **Serial GC:** Single thread, stop-the-world. For small apps.
- **Parallel GC:** Multiple threads for GC. Default in Java 8.
- **G1 GC:** Divides heap into regions, collects most garbage-filled first. Default since Java 9.
- **ZGC:** Ultra-low latency (< 10ms pause). For large heaps.
- **Shenandoah:** Similar to ZGC, concurrent collection.

---

## Spring Boot Interview Questions

**Q7: What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?**

**A:** All are specializations of `@Component` (all create Spring beans). `@Service` marks business logic layer. `@Repository` marks data access layer AND enables automatic exception translation (DB exceptions → Spring exceptions). `@Controller` marks web MVC controller (returns views). `@RestController` = `@Controller` + `@ResponseBody` (returns JSON).

---

**Q8: Explain Spring Boot auto-configuration.**

**A:** Spring Boot examines your classpath (JAR dependencies) and automatically configures beans. Example: if `spring-boot-starter-data-jpa` and `h2` are on the classpath, Spring auto-configures an in-memory database, `EntityManagerFactory`, and `TransactionManager` — zero XML. Custom properties override defaults. `@ConditionalOnClass`, `@ConditionalOnBean` annotations control when auto-configs activate.

---

**Q9: How does `@Transactional` work internally?**

**A:** Spring creates a **proxy** around the bean. When a `@Transactional` method is called:

1. Proxy intercepts the call
2. Starts a DB transaction
3. Delegates to the actual method
4. If method succeeds → COMMIT
5. If RuntimeException → ROLLBACK

**Gotcha:** Calling a `@Transactional` method from WITHIN the same class bypasses the proxy — the annotation is ignored! Solution: inject self or use `TransactionTemplate`.

---

**Q10: What is the difference between `@RequestParam`, `@PathVariable`, `@RequestBody`, and `@RequestHeader`?**

**A:**

```java
// @PathVariable — from URL path: /api/users/123
@GetMapping("/api/users/{id}")
public User getUser(@PathVariable Long id) { }

// @RequestParam — from query string: /api/users?name=Amit&page=2
@GetMapping("/api/users")
public List<User> search(@RequestParam String name, @RequestParam int page) { }

// @RequestBody — from JSON body (POST/PUT)
@PostMapping("/api/users")
public User create(@RequestBody CreateUserDTO dto) { }

// @RequestHeader — from HTTP headers
@GetMapping("/api/data")
public Data get(@RequestHeader("Authorization") String token) { }
```

---

## Database & SQL Interview Questions

**Q11: Write a SQL query to find the second highest salary.**

```sql
-- Method 1: Using LIMIT
SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;

-- Method 2: Using subquery
SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);

-- Method 3: Using DENSE_RANK (handles ties correctly)
SELECT salary FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank
    FROM employees
) ranked WHERE rank = 2;
```

---

**Q12: What is database connection pooling? Why is it important?**

**A:** Creating a DB connection is EXPENSIVE (TCP handshake, authentication, protocol negotiation) — 100-500ms each. A connection pool pre-creates and reuses connections. Spring Boot uses **HikariCP** by default — the fastest pool. Instead of creating a new connection per request, you borrow one from the pool and return it when done.

---

## Microservices Interview Questions

**Q13: How do you handle distributed transactions across microservices?**

**A:** You CAN'T use traditional 2-phase commit (2PC) across microservices — it's slow and creates tight coupling. Instead:

1. **Saga Pattern (Choreography):** Each service publishes events; next service reacts. On failure, compensating events undo previous steps.
2. **Saga Pattern (Orchestration):** A central orchestrator coordinates the flow and handles rollbacks.
3. **Outbox Pattern:** Write business data + event to the same DB in one transaction. A separate process publishes the event.
4. **Eventual Consistency:** Accept that data will be consistent EVENTUALLY, not instantly.

---

**Q14: What is service mesh?**

**A:** A service mesh (e.g., Istio, Linkerd) is an infrastructure layer that handles service-to-service communication: load balancing, encryption (mTLS), observability, retries, circuit breaking — WITHOUT modifying application code. It uses sidecar proxies (one per service) that intercept all network traffic.

---

## System Design Interview Questions

**Q15: Design a rate limiter.**

```
Requirements:
- Limit users to 100 requests per minute
- Distributed (works across multiple API servers)
- Low latency

Algorithm: Token Bucket with Redis

Client → API Server → Redis (check rate limit) → Process/Reject

Redis key: rate:user:{userId}
Redis commands:
1. INCR key → increment counter
2. EXPIRE key 60 → Set TTL to 60 seconds (if new key)
3. If count > 100 → reject with 429

Implementation:
┌──────────────────────────────────────────────────────┐
│  Redis: MULTI/ pipeline (atomic)                      │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 1. INCR rate:user:123                            │ │
│  │ 2. IF result == 1 THEN EXPIRE rate:user:123 60   │ │
│  │ 3. IF result > 100 THEN REJECT (429)             │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

Why Redis? Shared state across all API servers, O(1) operations, atomic INCR.
```

---

## Behavioral & Scenario Questions

**Q16: Tell me about a challenging bug you fixed.**

**Template:**

- **Situation:** What was the project and what went wrong?
- **Task:** What was your responsibility?
- **Action:** How did you debug and solve it?
- **Result:** What was the outcome?

**Example:** "In our e-commerce project, orders were randomly failing. I used structured logging with correlation IDs to trace the flow. Discovered a race condition in inventory check — two concurrent requests both saw stock=1 and both placed orders. Fixed with optimistic locking (`@Version`) on the inventory entity, and added a retry mechanism. Zero failures in the next month."

---

**Q17: How do you handle a production incident at 2 AM?**

**A:**

1. **Acknowledge** — join the incident channel
2. **Assess** — check monitoring dashboards (Grafana), error rates, logs
3. **Mitigate** — reduce impact (feature flag, rollback, scale up)
4. **Root cause** — find the actual problem
5. **Fix** — patch and deploy
6. **Post-mortem** — document what happened, what was learned, preventive actions

---

## Coding Challenges

**Challenge 1: Implement a simple LRU cache**

```java
class LRUCache<K, V> {
    private final int capacity;
    private final LinkedHashMap<K, V> cache;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new LinkedHashMap<>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > capacity;
            }
        };
    }

    public V get(K key) {
        return cache.getOrDefault(key, null);
    }

    public void put(K key, V value) {
        cache.put(key, value);
    }
}
```

**Challenge 2: Find the first non-repeating character in a string**

```java
public char firstNonRepeating(String s) {
    LinkedHashMap<Character, Integer> map = new LinkedHashMap<>();
    for (char c : s.toCharArray()) {
        map.put(c, map.getOrDefault(c, 0) + 1);
    }
    return map.entrySet().stream()
            .filter(e -> e.getValue() == 1)
            .map(Map.Entry::getKey)
            .findFirst()
            .orElse('_');
}
```

---

## Resume & Portfolio Tips

```
Resume Structure:
┌─────────────────────────────────────────────────────────┐
│  Name | Email | Phone | GitHub | LinkedIn               │
├─────────────────────────────────────────────────────────┤
│  PROFESSIONAL SUMMARY (2-3 lines)                       │
│  Java backend developer with experience in Spring Boot,  │
│  microservices, and REST API development.                │
├─────────────────────────────────────────────────────────┤
│  SKILLS                                                  │
│  Java 17, Spring Boot, Hibernate, MySQL, Redis,         │
│  Docker, Kafka, JUnit, Git, REST APIs                    │
├─────────────────────────────────────────────────────────┤
│  PROJECTS (most important section!)                      │
│  Project Name | Tech Stack | Your Contribution          │
│  • Built REST API with JWT auth (link to GitHub)         │
│  • Implemented caching with Redis (35% faster reads)     │
│  • Dockerized microservices with CI/CD pipeline          │
├─────────────────────────────────────────────────────────┤
│  EDUCATION                                               │
│  B.Tech in Computer Science, XYZ University, 2024       │
└─────────────────────────────────────────────────────────┘

Portfolio Projects (Must-Have):
1. Full-stack CRUD app with Spring Boot + JPA + MySQL
2. REST API with JWT authentication
3. Microservices project (2-3 services + gateway)
4. Something with Redis caching or Kafka messaging

GitHub Tips:
- Clean README.md with setup instructions
- API documentation (Swagger/OpenAPI)
- Well-structured packages
- Unit + integration tests
- Docker support (docker-compose.yml)
```

---

## Final Roadmap Recap

```
Your Journey Through 24 Sessions:

SESSION 1-5: JAVA CORE
├── S1:  Java Architecture & OOPs
├── S2:  Abstract Classes, Interfaces, Exceptions, Singleton
├── S3:  Lambda, Functional Interfaces, Collections
├── S4:  Generics, Streams, HashMap, Hashing
└── S5:  Multithreading, Synchronization, CompletableFuture

SESSION 6-8: BUILD TOOLS & SPRING INTRO
├── S6-7: Maven (POM, Lifecycle, Plugins, Multi-Module)
└── S8:   Spring MVC & REST APIs

SESSION 9-11: SPRING CORE & DATA
├── S9:   Spring IoC, DI, Bean Lifecycle, AOP
└── S10-11: Hibernate, JPA, Entity Relationships, N+1 Problem

SESSION 12-15: DATABASE & SECURITY
├── S12-13: Database Design, SQL, Indexing, Transactions
└── S14-15: Spring Security, JWT, OAuth2, RBAC

SESSION 16-19: PATTERNS, ARCHITECTURE & DEVOPS
├── S16: Design Patterns (Singleton, Factory, Builder, Observer, Strategy)
├── S17: Microservices (Eureka, Gateway, Circuit Breaker)
├── S18: Testing (JUnit, Mockito, MockMvc, Integration Tests)
└── S19: Docker, CI/CD, Kubernetes Basics

SESSION 20-24: ADVANCED & INTERVIEW PREP
├── S20: Caching (Redis) & Performance Optimization
├── S21: Message Queues (Kafka, RabbitMQ)
├── S22: System Design Fundamentals
├── S23: Git & Logging Best Practices
└── S24: Interview Preparation (YOU ARE HERE! 🎯)
```

---

> 🎯 **Session 24 Summary — CONGRATULATIONS!** 🎉 You've completed the entire Java Backend Course! You've mastered Java fundamentals, Spring Boot ecosystem, database design, security, microservices, DevOps, caching, messaging, system design, and interview preparation. You are now equipped with the knowledge to build production-grade backend systems and ace technical interviews. Keep building, keep learning, and keep growing! 🚀
