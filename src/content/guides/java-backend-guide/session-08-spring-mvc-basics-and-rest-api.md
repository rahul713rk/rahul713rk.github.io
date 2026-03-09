---
title: "Session 8: Spring MVC Basics & REST API Implementation"
description: "Step 7 of Java Backend Guide: Session 8: Spring MVC Basics & REST API Implementation."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 7
---

---

## Table of Contents

1. [Overview of Spring MVC Architecture](#overview-of-spring-mvc-architecture)
2. [Model, View, and Controller Components](#model-view-and-controller-components)
3. [Core HTTP Methods](#core-http-methods)
4. [Building RESTful APIs with Spring Boot](#building-restful-apis-with-spring-boot)
5. [Request/Response Handling Deep Dive](#requestresponse-handling-deep-dive)
6. [Exception Handling in APIs](#exception-handling-in-apis)
7. [Complete Project: Book Store REST API](#complete-project-book-store-rest-api)
8. [Interview Questions & Answers](#interview-questions--answers)

---

## Overview of Spring MVC Architecture

> 🏤 **Story: The Post Office**
> 
> Imagine a well-organized post office:
> 
> 1. A **customer** (browser/client) comes in and hands a **letter** (HTTP request) to the front desk.
> 2. The **front desk clerk** (DispatcherServlet) looks at the address and determines which **department** should handle it.
> 3. The clerk sends the letter to the correct **department** (Controller).
> 4. The department processes it, pulls data from **filing cabinets** (Model/Database), and writes a **response letter**.
> 5. If it's a traditional app, the department also picks a **fancy letterhead** (View template). If it's a REST API, they send raw data (JSON).
> 6. The response goes back through the front desk to the customer.
> 
> The **DispatcherServlet** is the heart of Spring MVC — it's the traffic cop that routes every request to the right handler.

### Spring MVC Request Flow

```
Client (Browser/Postman/React App)
     │
     │ HTTP Request (GET /api/books/42)
     ▼
┌─────────────────────────────────────────────┐
│           DispatcherServlet                  │
│        (Front Controller)                    │
│                                             │
│  1. Receives ALL requests                   │
│  2. Consults HandlerMapping                 │
│  3. Delegates to correct Controller         │
│  4. Processes response                      │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌───────────────────────────┐
│     Handler Mapping        │ ─── "Who handles /api/books/42?"
│ (URL → Controller method)  │
└───────────────┬────────────┘
                │
                ▼
┌───────────────────────────┐
│       Controller           │ ─── BookController.getBook(42)
│  (Business Logic Entry)    │
└───────────────┬────────────┘
                │
                ▼
┌───────────────────────────┐
│        Service Layer       │ ─── BookService.findById(42)
│   (Business Logic)         │
└───────────────┬────────────┘
                │
                ▼
┌───────────────────────────┐
│       Repository/DAO       │ ─── Database query
│    (Data Access)           │
└───────────────┬────────────┘
                │
                ▼
┌───────────────────────────┐
│  HttpMessageConverter     │ ─── Object → JSON
│  (Jackson ObjectMapper)    │
└───────────────┬────────────┘
                │
                ▼
Client receives JSON Response
```

---

## Model, View, and Controller Components

> 🎬 **Story: A Movie Production**
> 
> - **Model** = The SCRIPT — it contains all the data (dialogue, scenes, characters). The model knows nothing about how it will be filmed or displayed.
> - **View** = The CAMERA + SCREEN — it takes the script data and presents it beautifully to the audience. In REST APIs, the "view" is just the JSON/XML serializer.
> - **Controller** = The DIRECTOR — receives instructions ("Action!"), coordinates between the script (model) and camera (view), and makes decisions about what happens.

```java
// ========= MODEL — Just data, no logic =========
// File: Book.java
package com.abhishek.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private double price;
    private String isbn;

    // Constructor
    public Book(Long id, String title, String author, double price, String isbn) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.price = price;
        this.isbn = isbn;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
}

// ========= CONTROLLER — Receives requests, returns responses =========
// File: BookController.java
package com.abhishek.controller;

import com.abhishek.model.Book;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController  // = @Controller + @ResponseBody (JSON responses by default)
@RequestMapping("/api/books")
public class BookController {

    private List<Book> books = new ArrayList<>(List.of(
        new Book(1L, "Head First Java", "Kathy Sierra", 599.0, "978-0596009205"),
        new Book(2L, "Effective Java", "Joshua Bloch", 899.0, "978-0134685991"),
        new Book(3L, "Spring in Action", "Craig Walls", 1299.0, "978-1617294945")
    ));

    // GET — Retrieve all books
    @GetMapping
    public List<Book> getAllBooks() {
        return books;
    }

    // GET — Retrieve one book by ID
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return books.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    // POST — Create a new book
    @PostMapping
    public Book createBook(@RequestBody Book book) {
        book.setId((long) (books.size() + 1));
        books.add(book);
        return book;
    }

    // PUT — Update entire book
    @PutMapping("/{id}")
    public Book updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
        for (int i = 0; i < books.size(); i++) {
            if (books.get(i).getId().equals(id)) {
                updatedBook.setId(id);
                books.set(i, updatedBook);
                return updatedBook;
            }
        }
        return null;
    }

    // DELETE — Remove a book
    @DeleteMapping("/{id}")
    public Map<String, String> deleteBook(@PathVariable Long id) {
        books.removeIf(b -> b.getId().equals(id));
        return Map.of("message", "Book deleted", "id", id.toString());
    }
}
```

---

## Core HTTP Methods

> 📝 **Story: The Restaurant Menu Operations**
> 
> Think of a restaurant menu system:
> 
> - **GET** = "Show me the menu" / "Show me dish #5" — READ only, never changes anything
> - **POST** = "I want to ADD a new dish to the menu" — CREATE a new resource
> - **PUT** = "Replace dish #5 entirely with this new dish" — FULL UPDATE
> - **PATCH** = "Just change the price of dish #5" — PARTIAL UPDATE
> - **DELETE** = "Remove dish #5 from the menu" — DELETE a resource

| Method   | Purpose        | Idempotent? | Request Body? | Example               |
| -------- | -------------- | ----------- | ------------- | --------------------- |
| `GET`    | Read/Retrieve  | ✅ Yes       | ❌ No          | `GET /api/books`      |
| `POST`   | Create         | ❌ No        | ✅ Yes         | `POST /api/books`     |
| `PUT`    | Full Update    | ✅ Yes       | ✅ Yes         | `PUT /api/books/1`    |
| `PATCH`  | Partial Update | ✅ Yes       | ✅ Yes         | `PATCH /api/books/1`  |
| `DELETE` | Delete         | ✅ Yes       | ❌ Usually No  | `DELETE /api/books/1` |

**Idempotent** = calling it multiple times has the same effect as calling it once. `GET` book #1 ten times always returns the same book. `DELETE` book #1 ten times — first time deletes it, next nine times get "not found" (same final state). But `POST` creates a new book EACH time — not idempotent.

### HTTP Status Codes

```java
// File: StatusCodeExamples.java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
public class StatusCodeDemo {

    // 200 OK — success (default for @GetMapping)
    @GetMapping("/ok")
    public ResponseEntity<String> ok() {
        return ResponseEntity.ok("Everything is fine!");
    }

    // 201 CREATED — resource created successfully
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> create(@RequestBody Map<String, String> data) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("message", "Created!", "id", "42"));
    }

    // 204 NO CONTENT — success but nothing to return
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    // 400 BAD REQUEST — client sent invalid data
    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, String> data) {
        if (!data.containsKey("name")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Name is required"));
        }
        return ResponseEntity.ok(data);
    }

    // 404 NOT FOUND — resource doesn't exist
    @GetMapping("/find/{id}")
    public ResponseEntity<?> find(@PathVariable Long id) {
        if (id > 100) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("id", id, "name", "Found!"));
    }
}
```

```
HTTP Status Code Families:
  1xx — Informational
  2xx — Success       (200 OK, 201 Created, 204 No Content)
  3xx — Redirection   (301 Moved, 302 Found)
  4xx — Client Error  (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
  5xx — Server Error  (500 Internal Server Error, 503 Service Unavailable)
```

---

## Request/Response Handling Deep Dive

### Key Spring MVC Annotations

```java
// File: AnnotationsDemo.java
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/users") // Base path for all endpoints in this controller
public class UserController {

    // ===== @PathVariable — Extract value from URL path =====
    // GET /api/v1/users/42
    @GetMapping("/{userId}")
    public Map<String, Object> getUserById(@PathVariable("userId") Long id) {
        return Map.of("id", id, "name", "User " + id);
    }

    // Multiple path variables
    // GET /api/v1/users/42/orders/7
    @GetMapping("/{userId}/orders/{orderId}")
    public Map<String, Object> getUserOrder(
            @PathVariable Long userId, 
            @PathVariable Long orderId) {
        return Map.of("userId", userId, "orderId", orderId);
    }

    // ===== @RequestParam — Extract query parameters =====
    // GET /api/v1/users?page=1&size=10&sort=name
    @GetMapping
    public Map<String, Object> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String filter) {
        return Map.of(
            "page", page,
            "size", size,
            "sort", sort != null ? sort : "default",
            "filter", filter != null ? filter : "none"
        );
    }

    // ===== @RequestBody — Extract JSON body =====
    // POST /api/v1/users
    // Body: {"name": "Amit", "email": "amit@example.com"}
    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> userData) {
        Map<String, Object> response = new HashMap<>(userData);
        response.put("id", System.currentTimeMillis());
        response.put("createdAt", java.time.Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ===== @RequestHeader — Extract HTTP headers =====
    @GetMapping("/profile")
    public Map<String, String> getProfile(
            @RequestHeader("Authorization") String authToken,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId) {
        return Map.of(
            "token", authToken,
            "requestId", requestId != null ? requestId : "none"
        );
    }

    // ===== ResponseEntity — Full control over response =====
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String query) {
        if (query.length() < 3) {
            return ResponseEntity
                    .badRequest()
                    .header("X-Error-Reason", "Query too short")
                    .body(Map.of("error", "Query must be at least 3 characters"));
        }

        return ResponseEntity
                .ok()
                .header("X-Total-Results", "42")
                .header("X-Response-Time", "15ms")
                .body(Map.of("query", query, "results", List.of("User A", "User B")));
    }
}
```

---

## Exception Handling in APIs

> 🏥 **Story: The Hospital Emergency Protocol**
> 
> A hospital doesn't let random errors crash everything. Every department has an **emergency protocol**: if a surgery goes wrong, there's a specific response plan. Similarly, your API should have a **global exception handler** that catches errors and returns proper, formatted error responses instead of ugly stack traces.

```java
// File: ErrorResponse.java
package com.abhishek.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    public ErrorResponse(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public int getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

// File: ResourceNotFoundException.java
package com.abhishek.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: '%s'", resource, field, value));
    }
}

// File: GlobalExceptionHandler.java
package com.abhishek.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice // Global exception handler for ALL controllers
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            404, "Not Found", ex.getMessage(), request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            400, "Bad Request", ex.getMessage(), request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class) // Catch-all
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            500, "Internal Server Error", "Something went wrong", request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

Usage in controller:

```java
@GetMapping("/{id}")
public Book getBook(@PathVariable Long id) {
    return bookService.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
}
```

Response when book not found:

```json
{
    "status": 404,
    "error": "Not Found",
    "message": "Book not found with id: '999'",
    "path": "/api/books/999",
    "timestamp": "2024-01-15T10:30:45"
}
```

---

## Complete Project: Book Store REST API

```java
// File: BookStoreApplication.java
package com.abhishek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookStoreApplication {
    public static void main(String[] args) {
        SpringApplication.run(BookStoreApplication.class, args);
    }
}

// File: Book.java (Model)
package com.abhishek.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private String category;
    private double price;
    private int stock;

    public Book() {}

    public Book(Long id, String title, String author, String category, double price, int stock) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.category = category;
        this.price = price;
        this.stock = stock;
    }

    // All getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
}

// File: BookService.java (Service)
package com.abhishek.service;

import com.abhishek.model.Book;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class BookService {
    private final Map<Long, Book> bookStore = new LinkedHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    public BookService() {
        // Seed data
        addBook(new Book(null, "Head First Java", "Kathy Sierra", "Programming", 599, 50));
        addBook(new Book(null, "Clean Code", "Robert Martin", "Programming", 799, 30));
        addBook(new Book(null, "Sapiens", "Yuval Harari", "Non-Fiction", 499, 100));
        addBook(new Book(null, "Atomic Habits", "James Clear", "Self-Help", 399, 80));
    }

    public List<Book> findAll() {
        return new ArrayList<>(bookStore.values());
    }

    public Optional<Book> findById(Long id) {
        return Optional.ofNullable(bookStore.get(id));
    }

    public List<Book> findByCategory(String category) {
        return bookStore.values().stream()
                .filter(b -> b.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }

    public List<Book> search(String query) {
        String lower = query.toLowerCase();
        return bookStore.values().stream()
                .filter(b -> b.getTitle().toLowerCase().contains(lower) ||
                           b.getAuthor().toLowerCase().contains(lower))
                .collect(Collectors.toList());
    }

    public Book addBook(Book book) {
        Long id = idGenerator.incrementAndGet();
        book.setId(id);
        bookStore.put(id, book);
        return book;
    }

    public Optional<Book> updateBook(Long id, Book updatedBook) {
        if (!bookStore.containsKey(id)) return Optional.empty();
        updatedBook.setId(id);
        bookStore.put(id, updatedBook);
        return Optional.of(updatedBook);
    }

    public boolean deleteBook(Long id) {
        return bookStore.remove(id) != null;
    }

    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBooks", bookStore.size());
        stats.put("totalStock", bookStore.values().stream().mapToInt(Book::getStock).sum());
        stats.put("averagePrice", bookStore.values().stream()
                .mapToDouble(Book::getPrice).average().orElse(0));
        stats.put("categories", bookStore.values().stream()
                .collect(Collectors.groupingBy(Book::getCategory, Collectors.counting())));
        return stats;
    }
}

// File: BookController.java (Controller)
package com.abhishek.controller;

import com.abhishek.model.Book;
import com.abhishek.service.BookService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    // Constructor injection (preferred over @Autowired)
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // GET /api/books — Get all books
    // GET /api/books?category=Programming — Filter by category
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks(
            @RequestParam(required = false) String category) {
        List<Book> books = (category != null) 
                ? bookService.findByCategory(category) 
                : bookService.findAll();
        return ResponseEntity.ok(books);
    }

    // GET /api/books/42
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        return bookService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/books/search?q=java
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam("q") String query) {
        return ResponseEntity.ok(bookService.search(query));
    }

    // GET /api/books/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(bookService.getStatistics());
    }

    // POST /api/books
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        Book created = bookService.addBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/books/42
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return bookService.updateBook(id, book)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/books/42
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        if (bookService.deleteBook(id)) {
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
```

**Testing the API:**

```bash
# Get all books
curl http://localhost:8080/api/books

# Get by ID
curl http://localhost:8080/api/books/1

# Search
curl http://localhost:8080/api/books/search?q=java

# Filter by category
curl http://localhost:8080/api/books?category=Programming

# Create a new book
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Design Patterns","author":"Gang of Four","category":"Programming","price":1299,"stock":25}'

# Update a book
curl -X PUT http://localhost:8080/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Head First Java (3rd Ed)","author":"Kathy Sierra","category":"Programming","price":699,"stock":45}'

# Delete a book
curl -X DELETE http://localhost:8080/api/books/3

# Get statistics
curl http://localhost:8080/api/books/stats
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between `@Controller` and `@RestController`?**

**A:** `@RestController` = `@Controller` + `@ResponseBody`.

- `@Controller` returns a **view name** (HTML template). The method returns a String like `"home"`, and Spring looks for `home.html` template.
- `@RestController` returns the **object directly as JSON/XML**. Every method's return value is serialized by Jackson.

```java
@Controller
class WebController {
    @GetMapping("/home")
    String home(Model model) {
        model.addAttribute("name", "Amit");
        return "home"; // Returns the VIEW name "home.html"
    }
}

@RestController
class ApiController {
    @GetMapping("/api/home")
    Map<String, String> home() {
        return Map.of("name", "Amit"); // Returns JSON: {"name":"Amit"}
    }
}
```

---

**Q2: What is the role of DispatcherServlet?**

**A:** DispatcherServlet is the **Front Controller** in Spring MVC. It:

1. Intercepts ALL incoming HTTP requests
2. Consults `HandlerMapping` to find the right controller method
3. Invokes the controller method via `HandlerAdapter`
4. Gets the return value and passes it to `ViewResolver` (MVC) or `HttpMessageConverter` (REST)
5. Sends the response back to the client

It's auto-configured in Spring Boot via `DispatcherServletAutoConfiguration`.

---

**Q3: What is the difference between `@RequestParam` and `@PathVariable`?**

**A:**

- `@PathVariable` extracts from the **URL path**: `/api/users/42` → `@PathVariable Long id` = 42
- `@RequestParam` extracts from the **query string**: `/api/users?page=2&size=10` → `@RequestParam int page` = 2

Rule of thumb: Use `@PathVariable` for identifying resources (IDs, names). Use `@RequestParam` for filtering, sorting, pagination.

---

### Medium-Hard Questions

**Q4: How does Spring Boot serialize Java objects to JSON?**

**A:** Spring Boot uses **Jackson** library with `MappingJackson2HttpMessageConverter`. When a `@RestController` method returns an object:

1. Spring checks the `Accept` header (e.g., `application/json`)
2. Finds a matching `HttpMessageConverter`
3. Jackson's `ObjectMapper` scans the object's getters (JavaBean convention)
4. Creates JSON from the getter names: `getTitle()` → `"title"`, `getPrice()` → `"price"`

Customization options:

- `@JsonIgnore` — exclude a field from JSON
- `@JsonProperty("book_title")` — rename the JSON key
- `@JsonFormat(pattern = "yyyy-MM-dd")` — format dates
- Custom `ObjectMapper` bean in configuration

---

**Q5: What happens if two `@GetMapping` methods match the same URL? How does Spring resolve ambiguous mappings?**

**A:** If two methods map to the exact same URL and HTTP method, Spring throws `IllegalStateException: Ambiguous handler methods mapped` at startup — the application won't start.

If one is more specific than the other, Spring uses **specificity**: `/api/books/{id}` is more specific than `/api/books/**`. Parameters also add specificity: `@GetMapping(params = "type=pdf")` matches only when the `type` parameter is "pdf".

For content negotiation: `@GetMapping(produces = "application/json")` vs `produces = "application/xml"` resolves based on the client's `Accept` header.

---

**Q6: Explain `ResponseEntity` vs returning an object directly. When should you use each?**

**A:**

- **Returning object directly**: Simple, clean code. Always returns 200 OK.
  
  ```java
  @GetMapping("/books")
  public List<Book> getBooks() { return bookService.findAll(); }
  ```

- **Using ResponseEntity**: Full control over status code, headers, and body.
  
  ```java
  @GetMapping("/books/{id}")
  public ResponseEntity<Book> getBook(@PathVariable Long id) {
    return bookService.findById(id)
            .map(book -> ResponseEntity.ok()
                    .header("X-Cache", "HIT")
                    .body(book))
            .orElse(ResponseEntity.notFound().build()); // 404
  }
  ```

Use `ResponseEntity` when you need: different status codes (201, 404, etc.), custom headers, conditional responses, or no body (204 No Content).

---

> 🎯 **Session 8 Summary:** You've learned the Spring MVC architecture (DispatcherServlet → Controller → Service → Response), HTTP methods and status codes, how to build a complete CRUD REST API with proper annotations (`@RestController`, `@GetMapping`, `@PathVariable`, `@RequestBody`), and how to handle errors gracefully with `@RestControllerAdvice`. This is the foundation of every Spring Boot backend application!
