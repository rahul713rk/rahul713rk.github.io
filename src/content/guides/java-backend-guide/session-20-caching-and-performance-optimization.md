---
title: "Session 20: Caching & Performance Optimization"
description: "Step 16 of Java Backend Guide: Session 20: Caching & Performance Optimization."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 16
---

---

## Table of Contents

1. [Why Caching?](#why-caching)
2. [Caching Strategies](#caching-strategies)
3. [Spring Cache Abstraction](#spring-cache-abstraction)
4. [Redis as a Cache](#redis-as-a-cache)
5. [Cache Eviction Policies](#cache-eviction-policies)
6. [Database Query Optimization](#database-query-optimization)
7. [API Performance: Pagination, Compression, Async](#api-performance)
8. [Monitoring with Spring Actuator](#monitoring-with-spring-actuator)
9. [Complete Project: Cached Product API](#complete-project)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Why Caching?

> ⏱️ **Story: The Library Desk vs The Bookshelf**
> 
> Every time you need a book, you walk to the library (database), wait in line, find the book, and bring it to your desk. If you need the SAME book 100 times, you walk to the library 100 times.
> 
> **Caching** = keeping a copy of the book ON YOUR DESK. First time → go to library. Next 99 times → grab from desk instantly. Desk = cache, Library = database.
> 
> **Result:** Library queries drop by 99%, response time drops from 200ms to 2ms.

```
Without Cache:
Client → API → Database (100ms+ per query)
         ↓
         Response

With Cache:
Client → API → Cache HIT? → Yes → Return cached data (2ms)
                   ↓ No
                Database → Store in cache → Return data
```

---

## Caching Strategies

| Strategy          | How it works                                                     | Best for                      |
| ----------------- | ---------------------------------------------------------------- | ----------------------------- |
| **Cache-Aside**   | App checks cache first; if miss, loads from DB and puts in cache | General purpose (most common) |
| **Read-Through**  | Cache itself loads from DB on miss                               | Transparent caching           |
| **Write-Through** | App writes to cache + DB simultaneously                          | Strong consistency            |
| **Write-Behind**  | App writes to cache; cache async-writes to DB                    | High write throughput         |
| **Write-Around**  | App writes directly to DB; cache loads on next read              | Infrequently re-read data     |

```java
// Cache-Aside Pattern (most common)
class ProductService {
    public Product getProduct(Long id) {
        // 1. Check cache
        Product cached = cache.get("product:" + id);
        if (cached != null) return cached;    // Cache HIT

        // 2. Cache MISS → load from DB
        Product product = database.findById(id);

        // 3. Store in cache for next time
        cache.put("product:" + id, product, Duration.ofMinutes(30));

        return product;
    }
}
```

---

## Spring Cache Abstraction

```java
// Step 1: Enable caching
@SpringBootApplication
@EnableCaching
public class Application { }

// Step 2: Use cache annotations
@Service
public class ProductService {

    private final ProductRepository repository;

    // @Cacheable — Cache the result. Next call with same ID → return cached
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        System.out.println("🔍 Loading from DB: " + id); // Only printed on cache MISS
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    // @Cacheable with condition — only cache if price > 100
    @Cacheable(value = "products", key = "#id", condition = "#result.price > 100")
    public Product getExpensiveProduct(Long id) {
        return repository.findById(id).orElseThrow();
    }

    // @CachePut — ALWAYS executes the method AND updates the cache
    @CachePut(value = "products", key = "#product.id")
    public Product updateProduct(Product product) {
        return repository.save(product);
    }

    // @CacheEvict — Remove from cache
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }

    // @CacheEvict — Clear ALL entries in the cache
    @CacheEvict(value = "products", allEntries = true)
    public void clearCache() {
        System.out.println("🗑️ Cache cleared!");
    }

    // @Caching — Multiple cache operations
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#id"),
        @CacheEvict(value = "product-list", allEntries = true)
    })
    public void deleteAndClearList(Long id) {
        repository.deleteById(id);
    }
}
```

---

## Redis as a Cache

> 🏎️ **Story: The Pit Stop**
> 
> In Formula 1, pit stops happen in under 2 seconds. The team keeps tires, fuel, and tools PRE-POSITIONED (cached) at the pit lane. They don't manufacture tires during the race. **Redis** is your pit lane — an in-memory data store that serves data in microseconds.

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

**application.properties:**

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.type=redis
spring.cache.redis.time-to-live=600000  # 10 minutes in ms
spring.cache.redis.cache-null-values=false
```

```java
// Redis Configuration
@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Different TTLs for different caches
        Map<String, RedisCacheConfiguration> cacheConfigs = Map.of(
                "products", config.entryTtl(Duration.ofMinutes(30)),
                "users", config.entryTtl(Duration.ofMinutes(60)),
                "settings", config.entryTtl(Duration.ofHours(24))
        );

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }

    // RedisTemplate for direct Redis operations
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}

// Direct Redis usage (beyond Spring Cache)
@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void storeSession(String sessionId, UserSession session) {
        redisTemplate.opsForValue().set("session:" + sessionId, session, 
                Duration.ofMinutes(30));
    }

    public UserSession getSession(String sessionId) {
        return (UserSession) redisTemplate.opsForValue().get("session:" + sessionId);
    }

    // Redis data structures
    public void addToLeaderboard(String player, double score) {
        redisTemplate.opsForZSet().add("leaderboard", player, score);
    }

    public Set<Object> getTopPlayers(int count) {
        return redisTemplate.opsForZSet().reverseRange("leaderboard", 0, count - 1);
    }
}
```

---

## Database Query Optimization

```java
// ===== INDEXING (covered in Session 12-13) =====
// Ensure indexes exist on columns used in WHERE, JOIN, ORDER BY

// ===== PAGINATION — Don't load 1 million rows =====
@GetMapping("/api/products")
public Page<Product> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "name") String sortBy) {
    return productService.getProducts(PageRequest.of(page, size, Sort.by(sortBy)));
}

// ===== PROJECTIONS — Select only needed columns =====
// Instead of loading entire entity with 20 fields:
public interface ProductSummary {
    Long getId();
    String getName();
    Double getPrice();
}

@Query("SELECT p.id as id, p.name as name, p.price as price FROM Product p")
List<ProductSummary> findAllSummaries(); // Faster — less data transferred

// ===== BATCH OPERATIONS =====
@Modifying
@Query("UPDATE Product p SET p.price = p.price * :multiplier WHERE p.category = :category")
int updatePricesByCategory(@Param("category") String category, 
                           @Param("multiplier") double multiplier);
// One query updates thousands of rows, instead of loading each and saving!

// ===== CONNECTION POOLING (HikariCP — Spring Boot default) =====
// application.properties
// spring.datasource.hikari.maximum-pool-size=20
// spring.datasource.hikari.minimum-idle=5
```

---

## Monitoring with Spring Actuator

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
# application.properties
management.endpoints.web.exposure.include=health,info,metrics,caches,env
management.endpoint.health.show-details=always
```

```bash
# Health check
GET /actuator/health
# Response: {"status": "UP", "components": {"db": {"status": "UP"}, "redis": {"status": "UP"}}}

# Cache metrics
GET /actuator/caches
GET /actuator/metrics/cache.gets     # Total cache gets
GET /actuator/metrics/cache.puts     # Total cache puts

# JVM metrics
GET /actuator/metrics/jvm.memory.used
GET /actuator/metrics/http.server.requests    # Request latency
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is cache stampede and how do you prevent it?**

**A:** A cache stampede (thundering herd) occurs when a popular cache entry expires and THOUSANDS of concurrent requests all hit the database simultaneously to reload it.

Prevention:

1. **Lock/Mutex:** Only one thread loads from DB; others wait for the cache to be populated
2. **Early refresh:** Refresh cache BEFORE it expires (background thread)
3. **Stale-while-revalidate:** Return stale data while refreshing in background
4. **Randomized TTL:** Add jitter to TTL so entries don't all expire at once

---

**Q2: When should you NOT cache data?**

**A:** Don't cache: frequently changing data (stock prices, live scores), data that must always be consistent (bank balance during transfer), very large datasets (defeats cache purpose), rarely accessed data (wastes memory), personalized/unique data (low hit rate).

---

### Medium-Hard Questions

**Q3: Explain cache invalidation strategies.**

**A:** "There are only two hard things in CS: cache invalidation and naming things." — Phil Karlton.

Strategies:

1. **TTL (Time-To-Live):** Cache expires after fixed duration — simple, eventual consistency
2. **Event-driven:** When data changes, publish event → invalidate cache
3. **Write-through:** Every write updates both cache and DB simultaneously
4. **Versioning:** Each entry has a version; stale versions are discarded

In Spring: `@CacheEvict` for explicit invalidation, TTL configuration for time-based expiry, `@CachePut` for write-through.

---

> 🎯 **Session 20 Summary:** You've mastered caching fundamentals (cache-aside, write-through), Spring Cache annotations (@Cacheable, @CacheEvict, @CachePut), Redis as a cache store, query optimization (indexing, pagination, projections), and monitoring with Actuator. Caching is the #1 performance optimization for backend applications!
