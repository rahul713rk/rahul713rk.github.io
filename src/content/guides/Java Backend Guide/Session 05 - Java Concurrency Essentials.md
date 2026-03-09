# Session 5: Java Concurrency Essentials

---

## Table of Contents

1. [Introduction to Multithreading](#introduction-to-multithreading)
2. [Creating Threads — Thread Class & Runnable Interface](#creating-threads)
3. [Thread Lifecycle & States](#thread-lifecycle--states)
4. [Thread Pool Concepts & Join Operations](#thread-pool-concepts--join-operations)
5. [Synchronization Mechanisms](#synchronization-mechanisms)
6. [ExecutorService Framework](#executorservice-framework)
7. [Callable, Future & CompletableFuture](#callable-future--completablefuture)
8. [Complete Project: Concurrent File Downloader](#complete-project-concurrent-file-downloader)
9. [Interview Questions & Answers](#interview-questions--answers)

---

## Introduction to Multithreading

> 🍳 **Story: The Restaurant Kitchen**
> 
> Imagine a restaurant kitchen during dinner rush.
> 
> - **Single-threaded** = ONE chef doing everything: taking orders, chopping vegetables, cooking, plating, and cleaning. Customers wait forever.
> - **Multi-threaded** = FIVE chefs working simultaneously: one chops, one grills, one fries, one plates, one cleans. Customers get food fast!
> 
> But there's a catch — if two chefs try to use the SAME stove at the same time, chaos ensues (a **race condition**). They need a system: "If Chef A is using stove #2, Chef B must wait" (this is a **lock/synchronization**).
> 
> In Java, each chef is a **Thread** — an independent path of execution running concurrently within the same program (kitchen).

### Process vs Thread

| Aspect            | Process                                 | Thread                                      |
| ----------------- | --------------------------------------- | ------------------------------------------- |
| **Memory**        | Separate memory space                   | Shares memory within process                |
| **Communication** | Inter-process comm (slow)               | Shared variables (fast)                     |
| **Creation cost** | Expensive                               | Lightweight                                 |
| **Crash impact**  | One process crash doesn't affect others | One thread crash can kill the process       |
| **Example**       | Chrome browser = one process per tab    | A tab rendering HTML + running JS = threads |

---

## Creating Threads

### Method 1: Extending the Thread Class

```java
// File: ThreadClassDemo.java

class ChefThread extends Thread {
    private String dish;

    ChefThread(String dish) {
        this.dish = dish;
    }

    @Override
    public void run() {
        System.out.println("👨‍🍳 Chef [" + Thread.currentThread().getName() + 
                         "] started cooking: " + dish);
        try {
            Thread.sleep(2000); // Simulate cooking time
        } catch (InterruptedException e) {
            System.out.println("Chef interrupted!");
        }
        System.out.println("✅ Chef [" + Thread.currentThread().getName() + 
                         "] finished: " + dish);
    }
}

public class ThreadClassDemo {
    public static void main(String[] args) {
        System.out.println("🏠 Main thread: " + Thread.currentThread().getName());

        ChefThread chef1 = new ChefThread("Pasta");
        ChefThread chef2 = new ChefThread("Pizza");
        ChefThread chef3 = new ChefThread("Salad");

        chef1.setName("Chef-Antonio");
        chef2.setName("Chef-Marco");
        chef3.setName("Chef-Luigi");

        // start() creates a new thread. run() does NOT — it runs in the current thread!
        chef1.start(); // New thread starts
        chef2.start(); // Another new thread starts
        chef3.start(); // Another new thread starts

        System.out.println("🏠 Main thread continues working...");
        // Output order is NOT guaranteed — threads run concurrently!
    }
}
```

### Method 2: Implementing Runnable (Preferred)

```java
// File: RunnableDemo.java

class DownloadTask implements Runnable {
    private String fileName;

    DownloadTask(String fileName) {
        this.fileName = fileName;
    }

    @Override
    public void run() {
        System.out.println("⬇️  Downloading " + fileName + 
                         " [" + Thread.currentThread().getName() + "]");
        try {
            Thread.sleep((long) (Math.random() * 3000)); // Random download time
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("✅ Downloaded " + fileName);
    }
}

public class RunnableDemo {
    public static void main(String[] args) {
        // Method 1: Traditional Runnable
        Thread t1 = new Thread(new DownloadTask("file1.pdf"));

        // Method 2: Lambda (since Runnable is a functional interface!)
        Thread t2 = new Thread(() -> {
            System.out.println("⬇️  Downloading file2.pdf (lambda)");
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
            System.out.println("✅ Downloaded file2.pdf");
        });

        t1.start();
        t2.start();
    }
}
```

**Why Runnable is preferred over Thread:**

1. Java doesn't support multiple inheritance — extending `Thread` wastes your single `extends` slot
2. `Runnable` separates the task from the execution mechanism
3. Same `Runnable` can be run by different executors (thread pool, scheduled executor, etc.)
4. Better for resource management — Thread objects are heavier than Runnable objects

---

## Thread Lifecycle & States

```
        ┌─────────────────────────────────────────────────────────┐
        │                    Thread States                         │
        │                                                         │
        │  NEW ──start()──> RUNNABLE ──run()──> TERMINATED        │
        │                     │    ↑                               │
        │                     │    │                               │
        │          sleep()    │    │  sleep done / notify()        │
        │          wait()     ▼    │  I/O complete                 │
        │                  BLOCKED /                               │
        │                 WAITING /                                │
        │              TIMED_WAITING                               │
        └─────────────────────────────────────────────────────────┘
```

```java
// File: ThreadStatesDemo.java

public class ThreadStatesDemo {
    public static void main(String[] args) throws InterruptedException {
        // Observe thread state transitions
        Thread worker = new Thread(() -> {
            try {
                Thread.sleep(2000); // Will be in TIMED_WAITING
            } catch (InterruptedException e) {
                System.out.println("Worker interrupted");
            }
        }, "Worker-Thread");

        System.out.println("After creation:  " + worker.getState());  // NEW

        worker.start();
        System.out.println("After start():   " + worker.getState());  // RUNNABLE

        Thread.sleep(500);
        System.out.println("During sleep():  " + worker.getState());  // TIMED_WAITING

        worker.join(); // Wait for worker to finish
        System.out.println("After join():    " + worker.getState());  // TERMINATED

        // Priority
        Thread highPri = new Thread(() -> {}, "High-Priority");
        Thread lowPri = new Thread(() -> {}, "Low-Priority");
        highPri.setPriority(Thread.MAX_PRIORITY); // 10
        lowPri.setPriority(Thread.MIN_PRIORITY);  // 1
        System.out.println("\nHigh priority: " + highPri.getPriority());
        System.out.println("Low priority: " + lowPri.getPriority());

        // Daemon threads (background threads — JVM exits when only daemons remain)
        Thread daemon = new Thread(() -> {
            while (true) {
                System.out.println("Daemon running...");
                try { Thread.sleep(500); } catch (InterruptedException e) { break; }
            }
        });
        daemon.setDaemon(true); // Must be set BEFORE start()
        daemon.start();

        Thread.sleep(1500); // Main sleeps 1.5s
        System.out.println("Main ending — daemon will also die");
        // JVM exits, daemon thread is killed
    }
}
```

---

## Thread Pool Concepts & Join Operations

> 🏊 **Story: The Swimming Pool Lanes**
> 
> Imagine a swimming pool with exactly 4 lanes. People queue up to swim. When a lane is free, the next person in line gets it. No one needs to build a new lane each time (expensive!). They reuse the existing lanes.
> 
> **Thread Pool** = the pool with fixed lanes (threads). **Tasks** = people waiting to swim. Instead of creating/destroying threads for each task (expensive), we reuse a fixed set of threads from a pool.

### The `join()` Method

```java
// File: JoinDemo.java

public class JoinDemo {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("🍕 Pizza Order System\n");

        Thread makeDough = new Thread(() -> {
            System.out.println("1️⃣  Making dough...");
            try { Thread.sleep(2000); } catch (InterruptedException e) {}
            System.out.println("1️⃣  Dough ready ✅");
        });

        Thread addToppings = new Thread(() -> {
            System.out.println("2️⃣  Adding toppings...");
            try { Thread.sleep(1500); } catch (InterruptedException e) {}
            System.out.println("2️⃣  Toppings added ✅");
        });

        Thread bake = new Thread(() -> {
            System.out.println("3️⃣  Baking pizza...");
            try { Thread.sleep(3000); } catch (InterruptedException e) {}
            System.out.println("3️⃣  Pizza baked ✅");
        });

        // Step 1: MUST complete before Step 2
        makeDough.start();
        makeDough.join(); // Main thread WAITS here until makeDough finishes

        // Step 2: MUST complete before Step 3
        addToppings.start();
        addToppings.join(); // Wait for toppings

        // Step 3
        bake.start();
        bake.join(); // Wait for baking

        System.out.println("\n🍕 Pizza is ready! Serve to customer!");

        // Without join(), main thread would print "ready" before pizza is done!
    }
}
```

---

## Synchronization Mechanisms

> 🚽 **Story: The Single Bathroom**
> 
> In an office with 20 people and ONE bathroom, if two people try to enter simultaneously — disaster! So there's a **lock** on the door. When someone enters, they lock the door. Others must WAIT. When done, they unlock. This is exactly what `synchronized` does in Java.

### Race Condition (The Problem)

```java
// File: RaceConditionDemo.java

class BankAccount {
    private int balance = 10000;

    // WITHOUT synchronization — BROKEN!
    public void unsafeWithdraw(int amount) {
        if (balance >= amount) {
            // Danger zone: another thread might change balance HERE
            try { Thread.sleep(1); } catch (InterruptedException e) {} // Simulate delay
            balance -= amount;
            System.out.println(Thread.currentThread().getName() + 
                             " withdrew ₹" + amount + " | Balance: ₹" + balance);
        } else {
            System.out.println(Thread.currentThread().getName() + " — Insufficient funds!");
        }
    }

    // WITH synchronization — SAFE!
    public synchronized void safeWithdraw(int amount) {
        if (balance >= amount) {
            try { Thread.sleep(1); } catch (InterruptedException e) {}
            balance -= amount;
            System.out.println(Thread.currentThread().getName() + 
                             " withdrew ₹" + amount + " | Balance: ₹" + balance);
        } else {
            System.out.println(Thread.currentThread().getName() + " — Insufficient funds!");
        }
    }

    public int getBalance() { return balance; }
}

public class RaceConditionDemo {
    public static void main(String[] args) throws InterruptedException {
        BankAccount account = new BankAccount();

        // 10 threads trying to withdraw ₹1500 each from ₹10000
        // Expected: Only 6 should succeed (6 * 1500 = 9000 < 10000)
        // Without sync: Many might succeed due to race condition!

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> account.safeWithdraw(1500), "User-" + (i+1));
            threads[i].start();
        }

        for (Thread t : threads) t.join();

        System.out.println("\n💰 Final Balance: ₹" + account.getBalance());
    }
}
```

### Synchronized Block (Fine-grained locking)

```java
// File: SynchronizedBlockDemo.java
import java.util.*;

class TicketBookingSystem {
    private int availableTickets;
    private final List<String> bookings = new ArrayList<>();
    private final Object ticketLock = new Object(); // Dedicated lock object

    public TicketBookingSystem(int totalTickets) {
        this.availableTickets = totalTickets;
    }

    public void bookTicket(String customerName, int numTickets) {
        // Non-critical section — no locking needed
        System.out.println(customerName + " is browsing available seats...");

        // Critical section — lock only what's necessary
        synchronized (ticketLock) {
            if (availableTickets >= numTickets) {
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                availableTickets -= numTickets;
                bookings.add(customerName + " (x" + numTickets + ")");
                System.out.println("✅ " + customerName + " booked " + numTickets + 
                                 " tickets | Remaining: " + availableTickets);
            } else {
                System.out.println("❌ " + customerName + " — Only " + 
                                 availableTickets + " tickets left!");
            }
        }
    }

    public void printBookings() {
        System.out.println("\n📋 All Bookings:");
        bookings.forEach(b -> System.out.println("  " + b));
        System.out.println("Remaining tickets: " + availableTickets);
    }
}

public class SynchronizedBlockDemo {
    public static void main(String[] args) throws InterruptedException {
        TicketBookingSystem system = new TicketBookingSystem(10);

        Thread[] customers = {
            new Thread(() -> system.bookTicket("Amit", 3), "Amit"),
            new Thread(() -> system.bookTicket("Priya", 4), "Priya"),
            new Thread(() -> system.bookTicket("Karan", 2), "Karan"),
            new Thread(() -> system.bookTicket("Sneha", 3), "Sneha"),
            new Thread(() -> system.bookTicket("Rahul", 5), "Rahul"),
        };

        for (Thread t : customers) t.start();
        for (Thread t : customers) t.join();

        system.printBookings();
    }
}
```

### Volatile Keyword & Deadlock

```java
// File: VolatileAndDeadlockDemo.java

// ========= VOLATILE =========
class StopDemo {
    // Without volatile, thread might cache 'running' and never see the change
    private volatile boolean running = true;

    public void run() {
        System.out.println("Worker started");
        int count = 0;
        while (running) {
            count++;
        }
        System.out.println("Worker stopped after " + count + " iterations");
    }

    public void stop() {
        running = false;
    }
}

// ========= DEADLOCK EXAMPLE =========
class DeadlockDemo {
    private final Object lockA = new Object();
    private final Object lockB = new Object();

    // Thread 1: Locks A, then tries to lock B
    public void method1() {
        synchronized (lockA) {
            System.out.println(Thread.currentThread().getName() + " holding Lock A...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}

            System.out.println(Thread.currentThread().getName() + " waiting for Lock B...");
            synchronized (lockB) {
                System.out.println("Method 1 complete");
            }
        }
    }

    // Thread 2: Locks B, then tries to lock A — DEADLOCK!
    public void method2() {
        synchronized (lockB) {
            System.out.println(Thread.currentThread().getName() + " holding Lock B...");
            try { Thread.sleep(100); } catch (InterruptedException e) {}

            System.out.println(Thread.currentThread().getName() + " waiting for Lock A...");
            synchronized (lockA) {
                System.out.println("Method 2 complete");
            }
        }
    }
    // To prevent: always lock in the SAME ORDER (lockA before lockB, always)
}
```

---

## ExecutorService Framework

> 🏢 **Story: The HR Department**
> 
> In a company, instead of hiring a new employee for every task and firing them when done (creating/destroying threads), the **HR department** (ExecutorService) maintains a **team of permanent workers** (thread pool). When work arrives, it assigns it to an available worker. When the worker finishes, they go back to the team and wait for the next task.

```java
// File: ExecutorServiceDemo.java
import java.util.concurrent.*;

public class ExecutorServiceDemo {
    public static void main(String[] args) throws InterruptedException {

        // ===== 1. Fixed Thread Pool =====
        System.out.println("═══ Fixed Thread Pool (3 threads) ═══");
        ExecutorService fixedPool = Executors.newFixedThreadPool(3);

        for (int i = 1; i <= 6; i++) {
            final int taskId = i;
            fixedPool.submit(() -> {
                System.out.println("Task " + taskId + " running on " + 
                                 Thread.currentThread().getName());
                try { Thread.sleep(1000); } catch (InterruptedException e) {}
                System.out.println("Task " + taskId + " completed ✅");
            });
        }

        fixedPool.shutdown(); // No new tasks accepted
        fixedPool.awaitTermination(10, TimeUnit.SECONDS); // Wait for all to finish

        System.out.println("\n═══ Cached Thread Pool ═══");
        // Creates threads as needed, reuses idle threads
        ExecutorService cachedPool = Executors.newCachedThreadPool();

        for (int i = 1; i <= 5; i++) {
            final int taskId = i;
            cachedPool.submit(() -> {
                System.out.println("Task " + taskId + " on " + 
                                 Thread.currentThread().getName());
            });
        }

        cachedPool.shutdown();
        cachedPool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("\n═══ Scheduled Thread Pool ═══");
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

        // Run after 2 seconds delay
        scheduler.schedule(() -> System.out.println("⏰ Delayed task executed!"), 
                         2, TimeUnit.SECONDS);

        // Run every 1 second, starting after 0.5 seconds
        ScheduledFuture<?> repeating = scheduler.scheduleAtFixedRate(
            () -> System.out.println("🔄 Repeating task at " + System.currentTimeMillis() % 10000),
            500, 1000, TimeUnit.MILLISECONDS
        );

        Thread.sleep(4000); // Let it repeat a few times
        repeating.cancel(false);
        scheduler.shutdown();

        System.out.println("\n═══ Single Thread Executor ═══");
        // Guarantees tasks execute in ORDER (one at a time)
        ExecutorService single = Executors.newSingleThreadExecutor();
        for (int i = 1; i <= 3; i++) {
            final int taskId = i;
            single.submit(() -> System.out.println("Sequential task " + taskId));
        }
        single.shutdown();
        single.awaitTermination(5, TimeUnit.SECONDS);
    }
}
```

**Thread Pool Types:**

| Type                        | Threads          | Use Case                        |
| --------------------------- | ---------------- | ------------------------------- |
| `newFixedThreadPool(n)`     | Fixed (n)        | Known workload, CPU-bound tasks |
| `newCachedThreadPool()`     | Dynamic (0 to ∞) | Short-lived, bursty tasks       |
| `newSingleThreadExecutor()` | Fixed (1)        | Sequential task execution       |
| `newScheduledThreadPool(n)` | Fixed (n)        | Periodic/delayed tasks          |

---

## Callable, Future & CompletableFuture

> 📦 **Story: The Online Order Tracker**
> 
> When you order something online:
> 
> - **Runnable** = placing an order and forgetting about it (fire-and-forget, no tracking)
> - **Callable** = placing an order and getting a **tracking number** (Future)
> - **Future** = checking the tracking number to see if the package arrived
> - **CompletableFuture** = getting automatic notifications: "Your order is shipped!", then "Out for delivery!", then "Delivered!" — each step triggering the next automatically

```java
// File: CallableFutureDemo.java
import java.util.concurrent.*;
import java.util.*;

public class CallableFutureDemo {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        // ===== CALLABLE — Returns a result =====
        System.out.println("═══ Callable + Future ═══");

        Callable<Integer> calculateSum = () -> {
            System.out.println("Calculating sum...");
            Thread.sleep(2000);
            int sum = 0;
            for (int i = 1; i <= 100; i++) sum += i;
            return sum;
        };

        Future<Integer> future = executor.submit(calculateSum);

        System.out.println("Is done? " + future.isDone()); // false
        System.out.println("Doing other work while waiting...");

        Integer result = future.get(); // BLOCKS until result is ready
        System.out.println("Sum: " + result); // 5050
        System.out.println("Is done? " + future.isDone()); // true

        // Multiple futures
        System.out.println("\n═══ Multiple Futures ═══");
        List<Future<String>> futures = new ArrayList<>();

        String[] cities = {"Mumbai", "Delhi", "Bangalore", "Chennai"};
        for (String city : cities) {
            futures.add(executor.submit(() -> {
                Thread.sleep((long)(Math.random() * 2000));
                return city + ": " + (20 + (int)(Math.random() * 20)) + "°C";
            }));
        }

        // Collect results
        for (Future<String> f : futures) {
            System.out.println("🌡️ " + f.get()); // Blocks per future
        }

        executor.shutdown();

        // ===== COMPLETABLE FUTURE — Non-blocking, chainable =====
        System.out.println("\n═══ CompletableFuture (async pipeline) ═══");

        CompletableFuture<String> orderPipeline = CompletableFuture
            .supplyAsync(() -> {
                System.out.println("1. Placing order...");
                sleep(1000);
                return "ORD-12345";
            })
            .thenApply(orderId -> {
                System.out.println("2. Processing payment for " + orderId);
                sleep(1000);
                return orderId + " [PAID]";
            })
            .thenApply(status -> {
                System.out.println("3. Shipping " + status);
                sleep(1000);
                return status + " [SHIPPED]";
            })
            .thenApply(status -> {
                System.out.println("4. Delivering " + status);
                sleep(500);
                return status + " [DELIVERED]";
            });

        // Non-blocking! Main thread can do other things
        System.out.println("Main thread is free to do other work!\n");

        // Get final result
        String finalStatus = orderPipeline.get();
        System.out.println("\n📦 Final: " + finalStatus);

        // ===== Combining multiple CompletableFutures =====
        System.out.println("\n═══ Combining Futures ═══");

        CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return 5000; // Product price
        });

        CompletableFuture<Integer> discountFuture = CompletableFuture.supplyAsync(() -> {
            sleep(800);
            return 15; // Discount percentage
        });

        // Combine two futures
        CompletableFuture<String> finalPrice = priceFuture
            .thenCombine(discountFuture, (price, discount) -> {
                double finalP = price * (1 - discount / 100.0);
                return "Price: ₹" + price + " - " + discount + "% = ₹" + finalP;
            });

        System.out.println(finalPrice.get());

        // Handle exceptions
        CompletableFuture<String> withErrorHandling = CompletableFuture
            .supplyAsync(() -> {
                if (true) throw new RuntimeException("Service unavailable!");
                return "Success";
            })
            .exceptionally(ex -> "⚠️ Error: " + ex.getMessage());

        System.out.println(withErrorHandling.get());
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) {}
    }
}
```

---

## Complete Project: Concurrent File Downloader

```java
// File: ConcurrentDownloader.java
import java.util.concurrent.*;
import java.util.*;

class DownloadResult {
    String fileName;
    long fileSize;
    long downloadTimeMs;
    boolean success;
    String error;

    DownloadResult(String fileName, long fileSize, long downloadTimeMs) {
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.downloadTimeMs = downloadTimeMs;
        this.success = true;
    }

    DownloadResult(String fileName, String error) {
        this.fileName = fileName;
        this.error = error;
        this.success = false;
    }

    @Override
    public String toString() {
        if (success) {
            return String.format("✅ %-20s %6d KB in %4d ms", 
                               fileName, fileSize, downloadTimeMs);
        }
        return String.format("❌ %-20s FAILED: %s", fileName, error);
    }
}

class FileDownloader {
    private final ExecutorService executor;
    private final int maxConcurrentDownloads;

    public FileDownloader(int maxConcurrentDownloads) {
        this.maxConcurrentDownloads = maxConcurrentDownloads;
        this.executor = Executors.newFixedThreadPool(maxConcurrentDownloads);
    }

    public CompletableFuture<DownloadResult> downloadAsync(String fileName) {
        return CompletableFuture.supplyAsync(() -> {
            long start = System.currentTimeMillis();
            System.out.println("⬇️  [" + Thread.currentThread().getName() + 
                             "] Downloading: " + fileName);

            try {
                // Simulate download with random time and size
                long downloadTime = (long)(Math.random() * 3000 + 500);
                Thread.sleep(downloadTime);

                // Simulate occasional failures
                if (Math.random() < 0.15) {
                    throw new RuntimeException("Connection timeout");
                }

                long fileSize = (long)(Math.random() * 10000 + 100);
                long elapsed = System.currentTimeMillis() - start;

                return new DownloadResult(fileName, fileSize, elapsed);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return new DownloadResult(fileName, "Interrupted");
            } catch (RuntimeException e) {
                return new DownloadResult(fileName, e.getMessage());
            }
        }, executor);
    }

    public List<DownloadResult> downloadAll(List<String> fileNames) {
        long start = System.currentTimeMillis();

        System.out.println("═══════════════════════════════════════════════");
        System.out.println("  CONCURRENT FILE DOWNLOADER");
        System.out.println("  Files: " + fileNames.size() + 
                         " | Max Concurrent: " + maxConcurrentDownloads);
        System.out.println("═══════════════════════════════════════════════\n");

        // Submit all downloads asynchronously
        List<CompletableFuture<DownloadResult>> futures = fileNames.stream()
            .map(this::downloadAsync)
            .toList();

        // Wait for all to complete
        CompletableFuture<Void> allDone = CompletableFuture.allOf(
            futures.toArray(new CompletableFuture[0])
        );

        allDone.join(); // Wait for all downloads

        // Collect results
        List<DownloadResult> results = futures.stream()
            .map(CompletableFuture::join)
            .toList();

        long totalTime = System.currentTimeMillis() - start;

        // Print report
        System.out.println("\n═══════════════════════════════════════════════");
        System.out.println("  DOWNLOAD REPORT");
        System.out.println("═══════════════════════════════════════════════");
        results.forEach(r -> System.out.println("  " + r));

        long succeeded = results.stream().filter(r -> r.success).count();
        long totalSize = results.stream().filter(r -> r.success).mapToLong(r -> r.fileSize).sum();

        System.out.println("───────────────────────────────────────────────");
        System.out.printf("  Succeeded: %d/%d | Total Size: %d KB%n", 
                         succeeded, fileNames.size(), totalSize);
        System.out.printf("  Total Time: %d ms (concurrent)%n", totalTime);
        System.out.println("═══════════════════════════════════════════════");

        return results;
    }

    public void shutdown() {
        executor.shutdown();
    }
}

public class ConcurrentDownloader {
    public static void main(String[] args) {
        FileDownloader downloader = new FileDownloader(3);

        List<String> files = List.of(
            "spring-boot.jar",
            "hibernate.jar", 
            "lombok.jar",
            "jackson-core.jar",
            "log4j.jar",
            "junit-5.jar",
            "mysql-connector.jar",
            "redis-client.jar"
        );

        downloader.downloadAll(files);
        downloader.shutdown();
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What's the difference between `start()` and `run()` in Thread?**

**A:** `start()` creates a **new OS thread** and makes the JVM call `run()` on that new thread. `run()` simply executes the method in the **current thread** — no new thread is created. If you call `run()` directly, it's just a normal method call.

```java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));
t.run();   // Prints "main" — runs on main thread
t.start(); // Prints "Thread-0" — runs on a new thread
```

---

**Q2: What is the difference between `wait()` and `sleep()`?**

**A:**

| Aspect            | `wait()`                               | `sleep()`                 |
| ----------------- | -------------------------------------- | ------------------------- |
| **Class**         | `Object`                               | `Thread`                  |
| **Lock**          | Releases the lock                      | Does NOT release the lock |
| **Wake up**       | By `notify()`/`notifyAll()` or timeout | When sleep duration ends  |
| **Usage context** | Must be inside `synchronized` block    | Anywhere                  |
| **Purpose**       | Inter-thread communication             | Pausing execution         |

---

**Q3: What is a `volatile` variable?**

**A:** `volatile` ensures that reads and writes to a variable go directly to main memory, not CPU cache. Without it, each thread might cache the variable and never see changes made by other threads. `volatile` guarantees **visibility** (all threads see the latest value) but NOT **atomicity** (compound operations like `i++` still need synchronization).

Use `volatile` for: simple flags (`boolean running`), singleton double-checked locking.
Don't use for: counters or any read-modify-write operation (use `AtomicInteger` instead).

---

### Medium-Hard Questions

**Q4: What is a deadlock? How do you prevent and detect it?**

**A:** A deadlock occurs when two or more threads are permanently blocked, each waiting for a lock held by the other. Four conditions must ALL be true:

1. **Mutual exclusion** — resources can't be shared
2. **Hold and wait** — thread holds one resource while waiting for another
3. **No preemption** — resources can't be forcibly taken
4. **Circular wait** — Thread A waits for B, B waits for A

**Prevention strategies:**

1. **Lock ordering** — always acquire locks in the SAME order everywhere
2. **Try-lock with timeout** — `tryLock(timeout)` instead of blocking forever
3. **Lock-free algorithms** — use `AtomicInteger`, `ConcurrentHashMap`, etc.
4. **Single lock** — use one lock for related resources (reduces concurrency but eliminates deadlock)

**Detection:** Use `jstack <pid>` or `ThreadMXBean.findDeadlockedThreads()` to detect deadlocked threads at runtime. JVisualVM also shows deadlocks graphically.

---

**Q5: Explain the difference between `Runnable` and `Callable`. When would you use each?**

**A:**

| Feature           | `Runnable`                            | `Callable<V>`                |
| ----------------- | ------------------------------------- | ---------------------------- |
| **Method**        | `void run()`                          | `V call() throws Exception`  |
| **Return value**  | None                                  | Returns a value              |
| **Exceptions**    | Cannot throw checked exceptions       | Can throw checked exceptions |
| **Used with**     | `Thread`, `ExecutorService.execute()` | `ExecutorService.submit()`   |
| **Result access** | N/A                                   | Via `Future<V>`              |

Use `Runnable` for fire-and-forget tasks. Use `Callable` when you need a result or might throw checked exceptions.

---

**Q6: What is the ForkJoinPool? How does it differ from a regular ThreadPool?**

**A:** `ForkJoinPool` is designed for divide-and-conquer parallelism. It uses a **work-stealing** algorithm: idle threads steal tasks from busy threads' queues instead of sitting idle.

```
Regular ThreadPool:           ForkJoinPool:
  Queue → [T1, T2, T3]         T1: [subtask1, subtask2]
  Thread1 takes T1              T2: [subtask3]           ← T3 steals from T1!
  Thread2 takes T2              T3: [] (steals work)
  Thread3 takes T3
```

- Regular pool: best for independent tasks of similar size
- ForkJoinPool: best for recursive tasks that can be split (parallel streams use ForkJoinPool internally)

Key class: `RecursiveTask<V>` (returns result) and `RecursiveAction` (void).

---

**Q7: Is the following code thread-safe? If not, fix it.**

```java
class Counter {
    private int count = 0;

    public void increment() {
        count++; // Is this thread-safe?
    }

    public int getCount() {
        return count;
    }
}
```

**A:** NOT thread-safe! `count++` is actually three operations: read count, increment, write count. Two threads can read the same value, both increment it, and write back the same result — losing one increment.

**Fix options:**

```java
// Option 1: synchronized
public synchronized void increment() { count++; }

// Option 2: AtomicInteger (best for simple counters)
private AtomicInteger count = new AtomicInteger(0);
public void increment() { count.incrementAndGet(); }

// Option 3: ReentrantLock
private final ReentrantLock lock = new ReentrantLock();
public void increment() {
    lock.lock();
    try { count++; }
    finally { lock.unlock(); }
}
```

`AtomicInteger` uses **CAS (Compare-And-Swap)** — a hardware-level atomic operation that's faster than locking for simple operations.

---

> 🎯 **Session 5 Summary:** You've mastered multithreading fundamentals (Thread, Runnable), thread lifecycle & states, synchronization (avoiding race conditions & deadlocks), thread pools (ExecutorService), and modern async programming (CompletableFuture). These concepts are critical for building high-performance Java backend applications that handle thousands of concurrent requests!
