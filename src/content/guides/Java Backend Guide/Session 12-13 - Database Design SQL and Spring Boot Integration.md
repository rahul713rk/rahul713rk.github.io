# Session 12 & 13: Database Design, SQL & Spring Boot Integration

---

## Table of Contents

1. [Relational Database Design Principles](#relational-database-design-principles)
2. [Normalization — 1NF, 2NF, 3NF](#normalization)
3. [SQL Essentials for Backend Developers](#sql-essentials)
4. [Advanced SQL Queries](#advanced-sql-queries)
5. [Database Indexing](#database-indexing)
6. [Transactions & ACID Properties](#transactions--acid-properties)
7. [Connecting Databases to Spring Boot](#connecting-databases-to-spring-boot)
8. [Database Migrations with Flyway](#database-migrations-with-flyway)
9. [Complete Project: Library Management Database](#complete-project)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Relational Database Design Principles

> 🏗️ **Story: The Architect's Blueprint**
> 
> Before building a skyscraper, architects create detailed blueprints that plan every floor, room, pillar, and connection. They don't start laying bricks and figure it out later! **Database design** is the architect's blueprint for your data. A well-designed database is fast, consistent, and scalable. A poorly designed one becomes a maintenance nightmare.
> 
> Imagine a school that keeps ALL data in ONE giant spreadsheet: student name, address, class, teacher name, teacher subject, exam scores, fee paid... When a teacher changes their phone number, you'd update it in HUNDRED of rows. When a student takes 5 subjects, their name-address appears 5 times. This is **data redundancy** and it leads to **update anomalies**. The solution? **Split data into related tables** with clear relationships.

### Key Concepts

```
┌─────────────────────────────────────────────────────────┐
│  PRIMARY KEY (PK) — Unique identifier for each row      │
│  ├── Cannot be NULL                                      │
│  ├── Must be unique                                      │
│  └── Example: student_id, order_id                       │
│                                                          │
│  FOREIGN KEY (FK) — Links to PK of another table         │
│  ├── Creates relationships between tables                │
│  ├── Enforces referential integrity                      │
│  └── Example: order.customer_id → customer.id            │
│                                                          │
│  CANDIDATE KEY — Any column(s) that COULD be PK          │
│  COMPOSITE KEY — PK made of multiple columns             │
│  UNIQUE — Like PK but allows NULL                        │
│  NOT NULL — Column must have a value                     │
└─────────────────────────────────────────────────────────┘
```

---

## Normalization

> 🧹 **Story: The Messy Room to Organized Wardrobe**
> 
> - **Unnormalized:** Everything thrown in one pile — socks with shirts, books with shoes.
> - **1NF:** Separate items into categories — all socks together, all shirts together. No repeating groups.
> - **2NF:** Each shelf has a clear label — socks shelf only has socks (no partial dependencies).
> - **3NF:** No item is on a shelf because of ANOTHER item — each item belongs based on its OWN attribute (no transitive dependencies).

### Unnormalized (BAD)

```
| OrderID | Customer | City     | Items                        | Prices      |
|---------|----------|----------|------------------------------|-------------|
| 1       | Amit     | Mumbai   | Java Book, Spring Book       | 599, 899    |  ← Multiple values!
| 2       | Priya    | Delhi    | MySQL Guide                  | 499         |
| 3       | Amit     | Mumbai   | Clean Code, Design Patterns  | 799, 1299   |  ← Amit repeated!
```

### First Normal Form (1NF) — Eliminate repeating groups

```sql
-- Rule: Each cell must have ONE atomic value. No arrays/lists.
-- Split multi-valued cells into separate rows.

CREATE TABLE orders_1nf (
    order_id INT,
    customer_name VARCHAR(100),
    city VARCHAR(50),
    item_name VARCHAR(100),
    price DECIMAL(10,2),
    PRIMARY KEY (order_id, item_name)  -- Composite key
);

-- Data:
-- | order_id | customer | city   | item_name       | price |
-- |----------|----------|--------|-----------------|-------|
-- | 1        | Amit     | Mumbai | Java Book       | 599   |
-- | 1        | Amit     | Mumbai | Spring Book     | 899   |   ← Amit+Mumbai repeated!
-- | 3        | Amit     | Mumbai | Clean Code      | 799   |   ← Amit+Mumbai repeated!
```

### Second Normal Form (2NF) — Remove partial dependencies

```sql
-- Rule: Every non-key column must depend on the ENTIRE composite key.
-- "city" depends only on "customer_name", not on "item_name" → PARTIAL dependency

-- Split into two tables:
CREATE TABLE orders_2nf (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    city VARCHAR(50)        -- Still depends on customer, not order
);

CREATE TABLE order_items_2nf (
    order_id INT,
    item_name VARCHAR(100),
    price DECIMAL(10,2),
    PRIMARY KEY (order_id, item_name),
    FOREIGN KEY (order_id) REFERENCES orders_2nf(order_id)
);
```

### Third Normal Form (3NF) — Remove transitive dependencies

```sql
-- Rule: No non-key column should depend on ANOTHER non-key column.
-- "city" depends on "customer_name" (transitive via customer) → move to separate table

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    city VARCHAR(50)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    item_name VARCHAR(100),
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ✅ No redundancy! Change customer city in ONE place.
-- ✅ Each table has a single purpose.
```

---

## SQL Essentials

```sql
-- ═══════ DDL (Data Definition Language) ═══════

-- Create table
CREATE TABLE employees (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(12,2) DEFAULT 0,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter table
ALTER TABLE employees ADD COLUMN phone VARCHAR(15);
ALTER TABLE employees MODIFY COLUMN salary DECIMAL(15,2);
ALTER TABLE employees DROP COLUMN phone;

-- Create index
CREATE INDEX idx_emp_department ON employees(department);
CREATE UNIQUE INDEX idx_emp_email ON employees(email);


-- ═══════ DML (Data Manipulation Language) ═══════

-- Insert
INSERT INTO employees (name, email, department, salary, hire_date)
VALUES ('Amit Sharma', 'amit@example.com', 'Engineering', 75000, '2023-01-15');

INSERT INTO employees (name, email, department, salary, hire_date)
VALUES 
    ('Priya Patel', 'priya@example.com', 'Marketing', 65000, '2023-03-20'),
    ('Karan Singh', 'karan@example.com', 'Engineering', 80000, '2022-11-01'),
    ('Sneha Gupta', 'sneha@example.com', 'HR', 60000, '2023-06-10');

-- Update
UPDATE employees SET salary = salary * 1.10 WHERE department = 'Engineering';
UPDATE employees SET is_active = FALSE WHERE id = 3;

-- Delete
DELETE FROM employees WHERE is_active = FALSE;


-- ═══════ DQL (Data Query Language) ═══════

-- Basic SELECT
SELECT name, email, salary FROM employees WHERE department = 'Engineering';

-- Sorting
SELECT * FROM employees ORDER BY salary DESC, name ASC;

-- Filtering
SELECT * FROM employees 
WHERE salary BETWEEN 60000 AND 80000
  AND department IN ('Engineering', 'Marketing')
  AND name LIKE 'A%';        -- starts with A

-- Aggregation
SELECT 
    department,
    COUNT(*) as employee_count,
    AVG(salary) as avg_salary,
    MAX(salary) as max_salary,
    MIN(salary) as min_salary,
    SUM(salary) as total_salary
FROM employees
WHERE is_active = TRUE
GROUP BY department
HAVING COUNT(*) > 1           -- Filter AFTER grouping
ORDER BY avg_salary DESC;

-- Pagination
SELECT * FROM employees ORDER BY id LIMIT 10 OFFSET 20; -- Page 3, 10 per page
```

---

## Advanced SQL Queries

### JOINs

```sql
-- ═══════ JOINS ═══════

-- Sample tables
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    budget DECIMAL(15,2)
);

CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    department_id INT,
    salary DECIMAL(12,2),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- INNER JOIN — only matching rows from BOTH tables
SELECT s.name, s.salary, d.name as department
FROM staff s
INNER JOIN departments d ON s.department_id = d.id;

-- LEFT JOIN — ALL from left table, matched from right (NULL if no match)
SELECT s.name, d.name as department
FROM staff s
LEFT JOIN departments d ON s.department_id = d.id;
-- Shows employees even if they have no department

-- RIGHT JOIN — ALL from right, matched from left
SELECT s.name, d.name as department
FROM staff s
RIGHT JOIN departments d ON s.department_id = d.id;
-- Shows departments even if they have no employees

-- Employees WITHOUT a department
SELECT s.name FROM staff s
LEFT JOIN departments d ON s.department_id = d.id
WHERE d.id IS NULL;
```

### Subqueries and CTEs

```sql
-- SUBQUERY — query inside a query
-- Employees earning more than average
SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Departments with highest-paid employee
SELECT department, name, salary FROM employees e
WHERE salary = (SELECT MAX(salary) FROM employees WHERE department = e.department);

-- CTE (Common Table Expression) — readable subqueries
WITH department_stats AS (
    SELECT 
        department,
        AVG(salary) as avg_salary,
        COUNT(*) as emp_count
    FROM employees
    GROUP BY department
)
SELECT d.department, d.avg_salary, d.emp_count
FROM department_stats d
WHERE d.avg_salary > 65000
ORDER BY d.avg_salary DESC;

-- Window Functions (advanced!)
SELECT 
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
    DENSE_RANK() OVER (ORDER BY salary DESC) as overall_rank,
    SUM(salary) OVER (PARTITION BY department) as dept_total
FROM employees;
```

---

## Database Indexing

> 📚 **Story: The Book Index**
> 
> A textbook with 500 pages but NO index at the back — to find "Binary Search", you'd scan every page (O(n)). With an **index** at the back listing "Binary Search: page 147", you jump directly there (O(log n) with B-Tree index).
> 
> Database indexes work the same way — they create a separate, sorted data structure that points to the actual rows. Reads are FAST, but writes are SLOWER (index must be updated too).

```sql
-- Index types and when to use them

-- 1. B-Tree Index (default) — for equality and range queries
CREATE INDEX idx_salary ON employees(salary);
-- Fast: WHERE salary = 50000, WHERE salary > 50000

-- 2. Composite Index — for multi-column queries
CREATE INDEX idx_dept_salary ON employees(department, salary);
-- Fast: WHERE department = 'Eng' AND salary > 50000
-- Fast: WHERE department = 'Eng' (leftmost prefix)
-- SLOW: WHERE salary > 50000 (doesn't use index — column order matters!)

-- 3. Unique Index
CREATE UNIQUE INDEX idx_email ON employees(email);

-- 4. Full-Text Index — for text search
CREATE FULLTEXT INDEX idx_description ON products(description);
SELECT * FROM products WHERE MATCH(description) AGAINST ('comfortable shoes');

-- Check which indexes exist
SHOW INDEX FROM employees;

-- Explain query plan (see if index is used)
EXPLAIN SELECT * FROM employees WHERE department = 'Engineering';
```

**When to Index:**

- Columns in WHERE clauses (filter criteria)
- Columns in JOIN conditions (foreign keys)
- Columns in ORDER BY / GROUP BY

**When NOT to Index:**

- Small tables (full scan is faster)
- Columns with few distinct values (gender: M/F)
- Tables with heavy INSERT/UPDATE (index maintenance overhead)

---

## Transactions & ACID Properties

> 🏦 **Story: The Bank Transfer**
> 
> Transferring ₹5000 from Amit to Priya requires TWO operations:
> 
> 1. Deduct ₹5000 from Amit's account
> 2. Add ₹5000 to Priya's account
> 
> If the system crashes after step 1 but before step 2 — Amit loses ₹5000 but Priya doesn't get it! A **transaction** wraps both operations — EITHER both succeed, OR neither happens.

```
ACID Properties:
┌─────────────────────────────────────────────────────────┐
│  A — Atomicity:     All or nothing                       │
│  C — Consistency:   Database moves from valid → valid    │
│  I — Isolation:     Concurrent transactions don't interfere│
│  D — Durability:    Committed data survives crashes       │
└─────────────────────────────────────────────────────────┘
```

```sql
-- SQL Transaction
START TRANSACTION;

UPDATE accounts SET balance = balance - 5000 WHERE user_id = 1; -- Amit
UPDATE accounts SET balance = balance + 5000 WHERE user_id = 2; -- Priya

-- Check if everything is OK
-- If yes:
COMMIT;
-- If something went wrong:
-- ROLLBACK;
```

**Spring Boot Transaction Management:**

```java
@Service
public class BankService {

    @Transactional  // Spring manages the transaction
    public void transfer(Long fromId, Long toId, double amount) {
        Account from = accountRepository.findById(fromId).orElseThrow();
        Account to = accountRepository.findById(toId).orElseThrow();

        if (from.getBalance() < amount) {
            throw new InsufficientFundsException("Not enough balance!");
            // RuntimeException → Spring ROLLS BACK automatically!
        }

        from.setBalance(from.getBalance() - amount);
        to.setBalance(to.getBalance() + amount);

        accountRepository.save(from);
        accountRepository.save(to);
        // If no exception → Spring COMMITS
    }
}
```

**Isolation Levels:**
| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|-----------|-------------------|--------------|
| `READ_UNCOMMITTED` | ✅ Possible | ✅ Possible | ✅ Possible |
| `READ_COMMITTED` | ❌ Prevented | ✅ Possible | ✅ Possible |
| `REPEATABLE_READ` | ❌ | ❌ Prevented | ✅ Possible |
| `SERIALIZABLE` | ❌ | ❌ | ❌ Prevented |

---

## Connecting Databases to Spring Boot

### MySQL Configuration

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mydb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection pool (HikariCP — Spring Boot default)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=20000

# JPA settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

### Multiple DataSource Configuration

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

---

## Database Migrations with Flyway

> 🚚 **Story: Moving to a New House**
> 
> When you move, you keep a checklist: Box 1 → Kitchen, Box 2 → Bedroom... Each box is numbered and moved in order. **Flyway** works the same way — it manages database schema changes as numbered scripts, applied in order. You always know exactly what state your database is in.

**pom.xml:**

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

**Migration files** (in `src/main/resources/db/migration/`):

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V2__Create_orders_table.sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- V3__Add_phone_to_users.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(15);

-- V4__Seed_initial_data.sql
INSERT INTO users (name, email) VALUES ('Admin', 'admin@example.com');
```

**Flyway tracks which migrations have been applied in a `flyway_schema_history` table. It never re-runs old migrations.**

---

## Complete Project: Library Management Database

```sql
-- V1__Create_library_schema.sql

CREATE TABLE authors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    nationality VARCHAR(50),
    birth_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    author_id BIGINT NOT NULL,
    genre VARCHAR(50),
    published_year INT,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    membership_type ENUM('BASIC', 'PREMIUM', 'STUDENT') DEFAULT 'BASIC',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrowings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    book_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Indexes
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_borrowings_member ON borrowings(member_id);
CREATE INDEX idx_borrowings_dates ON borrowings(borrow_date, due_date);
```

**Useful Library Queries:**

```sql
-- Currently borrowed books (not returned)
SELECT m.name as member, b.title as book, br.borrow_date, br.due_date
FROM borrowings br
JOIN books b ON br.book_id = b.id
JOIN members m ON br.member_id = m.id
WHERE br.return_date IS NULL
ORDER BY br.due_date;

-- Overdue books
SELECT m.name, m.email, b.title, br.due_date,
       DATEDIFF(CURDATE(), br.due_date) as days_overdue
FROM borrowings br
JOIN books b ON br.book_id = b.id
JOIN members m ON br.member_id = m.id
WHERE br.return_date IS NULL AND br.due_date < CURDATE();

-- Most popular books
SELECT b.title, a.name as author, COUNT(br.id) as times_borrowed
FROM books b
JOIN authors a ON b.author_id = a.id
LEFT JOIN borrowings br ON b.id = br.book_id
GROUP BY b.id, b.title, a.name
ORDER BY times_borrowed DESC
LIMIT 10;

-- Genre statistics
SELECT genre, COUNT(*) as books, SUM(total_copies) as total_copies,
       AVG(available_copies) as avg_available
FROM books GROUP BY genre;
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between SQL, MySQL, PostgreSQL, and NoSQL?**

**A:**

- **SQL** — Structured Query Language, a language for querying databases
- **MySQL, PostgreSQL** — Relational Database Management Systems (RDBMS) that USE SQL
- **NoSQL** — Non-relational databases (MongoDB, Redis, Cassandra) that DON'T use SQL

| Feature  | MySQL          | PostgreSQL      | MongoDB (NoSQL)   |
| -------- | -------------- | --------------- | ----------------- |
| Type     | RDBMS          | RDBMS           | Document DB       |
| Schema   | Fixed (tables) | Fixed (tables)  | Flexible (JSON)   |
| Joins    | Yes            | Yes             | Limited           |
| ACID     | Yes            | Yes             | Configurable      |
| Best for | Web apps       | Complex queries | Unstructured data |

---

**Q2: What is denormalization and when would you use it?**

**A:** Denormalization intentionally adds redundancy to speed up reads. In a normalized DB, getting an order's customer name requires a JOIN. In a denormalized DB, the customer name is stored directly in the orders table.

Use when: read-heavy workloads, reporting/analytics databases, caching layers, microservices (each service owns its data).
Avoid when: data consistency is critical, write-heavy workloads.

---

### Medium-Hard Questions

**Q3: Explain the differences between clustered and non-clustered indexes.**

**A:**

- **Clustered Index:** The table data IS physically stored in index order. Only ONE per table (usually the primary key). Finding a row is like finding a word in a dictionary — the book itself is sorted.
- **Non-Clustered Index:** A separate structure with pointers to actual rows. Multiple allowed. Like a book's back index — sorted list pointing to page numbers.

In MySQL InnoDB, the PRIMARY KEY is always the clustered index. All other indexes are non-clustered and contain a reference to the primary key.

---

**Q4: What is a database deadlock? How do you prevent it?**

**A:** A deadlock occurs when two transactions each hold a lock that the other needs:

- T1 locks Row A, needs Row B
- T2 locks Row B, needs Row A
- Both wait forever

Prevention:

1. **Lock ordering** — always lock rows in the same order (by ID ascending)
2. **Lock timeout** — `SET innodb_lock_wait_timeout = 5;` (abort after 5 seconds)
3. **Keep transactions short** — less time holding locks
4. **Use proper isolation levels** — `READ_COMMITTED` usually sufficient

MySQL InnoDB detects deadlocks automatically and rolls back one transaction.

---

**Q5: What is the difference between `HAVING` and `WHERE`?**

**A:** `WHERE` filters ROWS before grouping. `HAVING` filters GROUPS after aggregation.

```sql
-- WHERE: filter individual rows
SELECT department, AVG(salary) FROM employees
WHERE salary > 30000          -- Filter ROWS first
GROUP BY department;

-- HAVING: filter aggregated groups
SELECT department, AVG(salary) as avg_sal FROM employees
GROUP BY department
HAVING AVG(salary) > 60000;   -- Filter GROUPS after aggregation
```

`WHERE` cannot use aggregate functions (`WHERE AVG(salary) > 60000` is INVALID). `HAVING` can.

---

> 🎯 **Sessions 12 & 13 Summary:** You've mastered database design (normalization 1NF-3NF), SQL fundamentals (DDL, DML, DQL), advanced queries (JOINs, subqueries, window functions, CTEs), indexing strategies, ACID transactions, Spring Boot database integration, and Flyway migrations. These skills are essential for every backend developer!
