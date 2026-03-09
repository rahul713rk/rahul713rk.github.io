---
title: "Session 10 & 11: Hibernate, JPA & Advanced JPA Concepts"
description: "Step 9 of Java Backend Guide: Session 10 & 11: Hibernate, JPA & Advanced JPA Concepts."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 9
---

---

## Table of Contents

1. [ORM Concepts — Why Hibernate?](#orm-concepts--why-hibernate)
2. [JPA vs Hibernate](#jpa-vs-hibernate)
3. [Setting Up Spring Data JPA](#setting-up-spring-data-jpa)
4. [Entity Mapping Annotations](#entity-mapping-annotations)
5. [CRUD with JPA Repositories](#crud-with-jpa-repositories)
6. [Entity Relationships](#entity-relationships)
7. [JPQL & Native Queries](#jpql--native-queries)
8. [Cascade Types & Fetch Strategies](#cascade-types--fetch-strategies)
9. [The N+1 Problem & Solutions](#the-n1-problem--solutions)
10. [Spring Data JPA Auditing](#spring-data-jpa-auditing)
11. [Complete Project: E-Commerce Data Layer](#complete-project)
12. [Interview Questions & Answers](#interview-questions--answers)

---

## ORM Concepts — Why Hibernate?

> 🌉 **Story: The Translator**
> 
> Imagine two countries that don't speak the same language — **Java Land** (objects, classes, inheritance) and **SQL Land** (tables, rows, foreign keys). Without a translator, developers must manually convert between the two languages every single time:
> 
> ```java
> // Without ORM — manual translation (painful!)
> ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = 1");
> rs.next();
> User user = new User();
> user.setId(rs.getLong("id"));
> user.setName(rs.getString("name"));
> user.setEmail(rs.getString("email"));
> // ... for EVERY field, EVERY query, EVERY table!
> ```
> 
> **Hibernate** is the translator — **Object-Relational Mapping (ORM)**. You work with Java objects, and Hibernate automatically translates to SQL. You never write `ResultSet` parsing again!

### JDBC vs Hibernate

| Aspect               | JDBC (Manual)               | Hibernate (ORM)            |
| -------------------- | --------------------------- | -------------------------- |
| **SQL**              | Write all SQL manually      | Generated automatically    |
| **Mapping**          | Manual `ResultSet` → Object | Automatic via annotations  |
| **Relationships**    | Manual JOIN queries         | `@OneToMany`, `@ManyToOne` |
| **Caching**          | Implement yourself          | Built-in L1/L2 cache       |
| **Database changes** | Rewrite all SQL             | Change dialect only        |
| **Boilerplate**      | High                        | Very Low                   |

---

## JPA vs Hibernate

```
┌─────────────────────────────────────────────────────────┐
│  JPA (Jakarta Persistence API) — The SPECIFICATION      │
│  ├── Defines interfaces: EntityManager, @Entity, etc.   │
│  ├── Defines rules: how ORM should behave               │
│  └── Like JDBC — an API/contract, not an implementation  │
├─────────────────────────────────────────────────────────┤
│  Hibernate — The IMPLEMENTATION                          │
│  ├── Implements all JPA interfaces                       │
│  ├── Adds extra features (caching, custom types, etc.)   │
│  └── Like MySQL Connector — implements JDBC              │
├─────────────────────────────────────────────────────────┤
│  Spring Data JPA — The CONVENIENCE LAYER                 │
│  ├── Sits on top of JPA (Hibernate)                      │
│  ├── Auto-generates repository implementations           │
│  └── Provides query derivation from method names         │
└─────────────────────────────────────────────────────────┘

Code uses JPA annotations → Hibernate implements them → Spring Data JPA makes it easy
```

---

## Setting Up Spring Data JPA

**pom.xml dependencies:**

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    <!-- For production: MySQL -->
    <!--
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    -->
</dependencies>
```

**application.properties:**

```properties
# H2 Database (for development)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate settings
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.h2.console.enabled=true

# ─── For MySQL (production) ───
# spring.datasource.url=jdbc:mysql://localhost:3306/mydb
# spring.datasource.username=root
# spring.datasource.password=root
# spring.jpa.hibernate.ddl-auto=update
# spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

**`ddl-auto` values:**
| Value | Behavior | Use In |
|-------|----------|--------|
| `create` | Drop + create tables every startup | Dev |
| `create-drop` | Drop + create on startup, drop on shutdown | Tests |
| `update` | Update schema without losing data | Dev/Staging |
| `validate` | Only validate, never change schema | Production |
| `none` | Do nothing | Production (with Flyway/Liquibase) |

---

## Entity Mapping Annotations

```java
// File: User.java
package com.abhishek.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity                          // Marks this class as a JPA entity (maps to a table)
@Table(name = "users",           // Customize table name
       uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {

    @Id                          // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phone;

    @Enumerated(EnumType.STRING) // Store enum as STRING (not ordinal number)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist // Called before INSERT
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate // Called before UPDATE
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public User() {} // JPA requires a no-arg constructor!

    public User(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

enum UserStatus {
    ACTIVE, INACTIVE, SUSPENDED
}
```

**Generation Strategies:**
| Strategy | Description | Database |
|----------|-------------|----------|
| `IDENTITY` | DB auto-increment | MySQL, PostgreSQL |
| `SEQUENCE` | Uses DB sequence | PostgreSQL, Oracle |
| `TABLE` | Separate table for IDs | Any (slow) |
| `AUTO` | Hibernate picks best | Any |

---

## CRUD with JPA Repositories

```java
// File: UserRepository.java
package com.abhishek.repository;

import com.abhishek.entity.User;
import com.abhishek.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

// JpaRepository<EntityType, PrimaryKeyType>
// Spring generates the FULL implementation at runtime!
public interface UserRepository extends JpaRepository<User, Long> {

    // ===== QUERY DERIVATION — Spring writes SQL from method name =====

    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT * FROM users WHERE name LIKE '%keyword%'
    List<User> findByNameContainingIgnoreCase(String keyword);

    // SELECT * FROM users WHERE status = ?
    List<User> findByStatus(UserStatus status);

    // SELECT * FROM users WHERE status = ? ORDER BY name ASC
    List<User> findByStatusOrderByNameAsc(UserStatus status);

    // SELECT COUNT(*) FROM users WHERE status = ?
    long countByStatus(UserStatus status);

    // SELECT * FROM users WHERE email = ? AND status = ?
    Optional<User> findByEmailAndStatus(String email, UserStatus status);

    // SELECT EXISTS FROM users WHERE email = ?
    boolean existsByEmail(String email);

    // DELETE FROM users WHERE status = ?
    void deleteByStatus(UserStatus status);
}

// File: UserService.java
package com.abhishek.service;

import com.abhishek.entity.User;
import com.abhishek.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user); // INSERT
    }

    // READ
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    // UPDATE
    public User updateUser(Long id, User updatedUser) {
        User existing = getUserById(id);
        existing.setName(updatedUser.getName());
        existing.setPhone(updatedUser.getPhone());
        return userRepository.save(existing); // UPDATE (because ID exists)
    }

    // DELETE
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found: " + id);
        }
        userRepository.deleteById(id); // DELETE
    }

    // PAGINATION
    public Page<User> getUsersPaginated(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return userRepository.findAll(pageable);
    }

    // SEARCH
    public List<User> searchUsers(String keyword) {
        return userRepository.findByNameContainingIgnoreCase(keyword);
    }
}
```

---

## Entity Relationships

> 🏘️ **Story: The Neighborhood**
> 
> In a neighborhood:
> 
> - One **house** has many **rooms** → `@OneToMany`
> - Each **room** belongs to ONE **house** → `@ManyToOne`
> - One **person** has ONE **passport** → `@OneToOne`
> - Many **students** take many **courses** → `@ManyToMany`

### OneToMany / ManyToOne

```java
// File: Department.java
@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // One department has MANY employees
    @OneToMany(mappedBy = "department",     // "department" is the field in Employee
               cascade = CascadeType.ALL,    // Operations cascade to children
               orphanRemoval = true)          // Remove child when removed from list
    private List<Employee> employees = new ArrayList<>();

    // Helper methods (IMPORTANT for bidirectional relationships!)
    public void addEmployee(Employee emp) {
        employees.add(emp);
        emp.setDepartment(this); // Maintain both sides!
    }

    public void removeEmployee(Employee emp) {
        employees.remove(emp);
        emp.setDepartment(null);
    }

    // Constructors, getters, setters...
}

// File: Employee.java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double salary;

    // Many employees belong to ONE department
    @ManyToOne(fetch = FetchType.LAZY)  // Don't load department until accessed
    @JoinColumn(name = "department_id", // FK column in employees table
                nullable = false)
    private Department department;

    // Constructors, getters, setters...
}
```

### ManyToMany

```java
// File: Student.java
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany
    @JoinTable(
        name = "student_courses",               // Join table name
        joinColumns = @JoinColumn(name = "student_id"),          // FK to Student
        inverseJoinColumns = @JoinColumn(name = "course_id")     // FK to Course
    )
    private Set<Course> courses = new HashSet<>();
}

// File: Course.java
@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToMany(mappedBy = "courses")  // Student owns the relationship
    private Set<Student> students = new HashSet<>();
}

// Generated join table:
// student_courses (student_id, course_id)
```

### OneToOne

```java
@Entity
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String bio;
    private String avatarUrl;
}
```

---

## JPQL & Native Queries

```java
// File: UserRepository.java (extended)
public interface UserRepository extends JpaRepository<User, Long> {

    // ===== JPQL — Java Persistence Query Language =====
    // Uses ENTITY names (User, not "users" table)

    @Query("SELECT u FROM User u WHERE u.status = :status AND u.name LIKE %:name%")
    List<User> findActiveByName(@Param("status") UserStatus status, 
                                @Param("name") String name);

    @Query("SELECT u FROM User u WHERE u.email = ?1") // Positional parameter
    Optional<User> findByEmailJPQL(String email);

    @Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
    List<Object[]> countByStatusGroup();

    // Update query
    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") UserStatus status);

    // ===== NATIVE SQL — Real SQL =====
    @Query(value = "SELECT * FROM users WHERE DATEDIFF(CURDATE(), created_at) < 7", 
           nativeQuery = true)
    List<User> findRecentUsers();

    @Query(value = "SELECT status, COUNT(*) as cnt FROM users GROUP BY status", 
           nativeQuery = true)
    List<Object[]> getStatusDistribution();
}
```

---

## Cascade Types & Fetch Strategies

### Cascade Types

```java
// CascadeType options:
@OneToMany(cascade = CascadeType.ALL)  // PERSIST + MERGE + REMOVE + REFRESH + DETACH
@OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}) // Only save and update
@OneToMany(cascade = CascadeType.REMOVE) // Delete children when parent deleted
```

| Cascade Type | When                                  | Example                                    |
| ------------ | ------------------------------------- | ------------------------------------------ |
| `PERSIST`    | Parent saved → children saved         | Save department → employees auto-saved     |
| `MERGE`      | Parent updated → children updated     | Update department → employees auto-updated |
| `REMOVE`     | Parent deleted → children deleted     | Delete department → employees auto-deleted |
| `REFRESH`    | Parent refreshed → children refreshed | Reload from DB                             |
| `ALL`        | All of the above                      | Most common for parent-child               |

### Fetch Strategies

```java
// EAGER: Load relationship IMMEDIATELY with parent (1 big query or N+1 queries)
@OneToMany(fetch = FetchType.EAGER)
private List<Employee> employees;

// LAZY: Load relationship ONLY WHEN ACCESSED (recommended!)
@OneToMany(fetch = FetchType.LAZY) 
private List<Employee> employees;
```

**Defaults:**

- `@OneToOne` → EAGER
- `@ManyToOne` → EAGER
- `@OneToMany` → LAZY ✅
- `@ManyToMany` → LAZY ✅

**Best practice: Always use LAZY, and use `JOIN FETCH` when you need eager loading for a specific query.**

---

## The N+1 Problem & Solutions

> 💀 **Story: The Inefficient Librarian**
> 
> You ask the librarian for a list of all departments. She gives you 10 departments (1 query). Then for EACH department, you ask "what employees are in this department?" — 10 MORE queries. That's 1 + 10 = 11 queries when 1 JOIN query would have sufficed. This is the **N+1 Problem** — the silent performance killer!

```java
// THE PROBLEM:
List<Department> departments = departmentRepository.findAll(); // 1 query
for (Department dept : departments) {
    System.out.println(dept.getEmployees()); // N more queries! (one per department)
}
// Total: 1 + N queries 💀

// SOLUTION 1: JOIN FETCH (JPQL)
@Query("SELECT d FROM Department d JOIN FETCH d.employees")
List<Department> findAllWithEmployees(); // 1 query with JOIN!

// SOLUTION 2: @EntityGraph
@EntityGraph(attributePaths = {"employees"})
List<Department> findAll(); // Spring adds JOIN automatically

// SOLUTION 3: @BatchSize (Hibernate-specific)
@OneToMany(mappedBy = "department")
@BatchSize(size = 10) // Loads employees in batches of 10 departments
private List<Employee> employees;
```

---

## Spring Data JPA Auditing

```java
// Enable auditing in main app
@SpringBootApplication
@EnableJpaAuditing
public class Application { }

// Base entity with audit fields
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    // Getters & setters...
}

// All entities extend this
@Entity
public class Product extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double price;
}
```

---

## Complete Project: E-Commerce Data Layer

```java
// File: Product.java
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private double price;
    private int stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews = new ArrayList<>();

    // Constructors, getters, setters...
}

// File: Category.java
@Entity
@Table(name = "categories")
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @OneToMany(mappedBy = "category")
    private List<Product> products = new ArrayList<>();
}

// File: Review.java
@Entity
@Table(name = "reviews")
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating; // 1-5
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "reviewer_name")
    private String reviewerName;
}

// File: ProductRepository.java
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryName(String categoryName);

    List<Product> findByPriceBetween(double min, double max);

    @Query("SELECT p FROM Product p JOIN FETCH p.reviews WHERE p.id = :id")
    Optional<Product> findByIdWithReviews(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE p.stock < :threshold")
    List<Product> findLowStock(@Param("threshold") int threshold);

    @Query("SELECT p.category.name, AVG(p.price), COUNT(p) FROM Product p GROUP BY p.category.name")
    List<Object[]> getCategoryStats();

    Page<Product> findByCategoryName(String categoryName, Pageable pageable);
}

// File: ProductService.java
@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional(readOnly = true) // Optimization for read-only queries
    public Page<Product> getProducts(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size, Sort.by("name")));
    }

    public Product addReview(Long productId, Review review) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        review.setProduct(product);
        product.getReviews().add(review);
        return productRepository.save(product); // Cascades to save review too!
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between JPA and Hibernate?**

**A:** JPA (Jakarta Persistence API) is a **specification** — a set of interfaces and annotations that define HOW ORM should work in Java. Hibernate is an **implementation** of JPA — it provides the actual code behind those interfaces. Other implementations include EclipseLink and OpenJPA. Using JPA annotations makes your code portable across implementations. Using Hibernate-specific features ties you to Hibernate.

---

**Q2: What is the difference between `save()` and `saveAndFlush()` in JpaRepository?**

**A:** `save()` persists the entity but may defer the actual SQL INSERT/UPDATE — Hibernate batches SQL statements for performance and flushes at transaction commit. `saveAndFlush()` immediately writes to the database. Use `saveAndFlush()` when you need the generated ID immediately or when subsequent queries must see the change.

---

### Medium-Hard Questions

**Q3: Explain the Hibernate first-level cache (L1) and second-level cache (L2).**

**A:**

- **L1 Cache (Session cache):** Enabled by default, scoped to a single `EntityManager`/Session/Transaction. If you call `findById(1)` twice in the same transaction, the second call returns the cached object — no SQL. Clears when the session closes.
- **L2 Cache:** Shared across sessions/transactions. Must be explicitly configured (e.g., with Ehcache, Hazelcast). If User #1 was loaded in Transaction A, Transaction B can get it from L2 cache without hitting the database.

```
Transaction 1:
  findById(1) → SQL query → result cached in L1 AND L2
  findById(1) → L1 cache hit (no SQL)

Transaction 2:
  findById(1) → L1 miss → L2 cache hit (no SQL)
```

---

**Q4: What is the N+1 problem? How do you detect and fix it?**

**A:** When loading a list of N entities that have LAZY relationships, and then accessing the relationship on each entity, Hibernate fires 1 query for the list + N queries for the relationships = N+1 total queries.

**Detection:** Enable `spring.jpa.show-sql=true` and watch the logs. Or use Hibernate statistics: `spring.jpa.properties.hibernate.generate_statistics=true`.

**Fixes:**

1. `JOIN FETCH` in JPQL: `SELECT d FROM Department d JOIN FETCH d.employees`
2. `@EntityGraph`: `@EntityGraph(attributePaths = {"employees"})`
3. `@BatchSize(size = N)`: loads relationships in batches
4. DTO projections: select only needed columns, avoiding entity relationships entirely

---

**Q5: What is the difference between `EAGER` and `LAZY` fetching? When to use each?**

**A:**

- **EAGER:** Loads the relationship immediately with the parent query (using JOIN or additional query). Safe but wastes resources if you don't always need the data.
- **LAZY:** Loads the relationship only when you ACCESS the getter. Efficient but can cause `LazyInitializationException` if accessed outside a transaction/session.

Best practice: **Default to LAZY** for all relationships. Use `JOIN FETCH` or `@EntityGraph` in specific queries where you KNOW you need the related data. This avoids both N+1 problems and unnecessary data loading.

---

**Q6: What does `@Transactional` do and how does it work?**

**A:** `@Transactional` creates a **proxy** around the annotated method. Before the method runs, Spring starts a database transaction. If the method completes successfully, the transaction is committed. If a RuntimeException is thrown, the transaction is rolled back.

Key attributes:

- `readOnly = true` — optimization for SELECT-only operations
- `propagation = REQUIRED` (default) — join existing transaction or create new one
- `isolation = READ_COMMITTED` — prevents dirty reads
- `rollbackFor = Exception.class` — specify which exceptions trigger rollback

**Gotcha:** `@Transactional` only works through the Spring proxy. If a method calls ANOTHER method in the SAME class with `@Transactional`, the proxy is NOT involved — the annotation is ignored! Solution: inject self or use `TransactionTemplate`.

---

> 🎯 **Sessions 10 & 11 Summary:** You've mastered ORM concepts, JPA vs Hibernate, entity mapping (@Entity, @Table, @Column), CRUD with Spring Data JPA repositories, entity relationships (OneToMany, ManyToOne, ManyToMany), JPQL queries, cascade types, fetch strategies (LAZY vs EAGER), the N+1 problem with solutions, and JPA auditing. This is the data access foundation for every Spring Boot application!
