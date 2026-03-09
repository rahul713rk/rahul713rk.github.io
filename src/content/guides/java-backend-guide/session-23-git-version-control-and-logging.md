---
title: "Session 23: Git Version Control & Logging Best Practices"
description: "Step 19 of Java Backend Guide: Session 23: Git Version Control & Logging Best Practices."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 19
---

---

## Table of Contents

1. [Git Fundamentals](#git-fundamentals)
2. [Branching Strategies](#branching-strategies)
3. [Git Workflow for Teams](#git-workflow-for-teams)
4. [Advanced Git Commands](#advanced-git-commands)
5. [Logging in Java — SLF4J & Logback](#logging-in-java)
6. [Structured Logging](#structured-logging)
7. [Centralized Logging (ELK Stack)](#centralized-logging)
8. [Interview Questions & Answers](#interview-questions--answers)

---

## Git Fundamentals

> 📸 **Story: The Time Machine Photo Album**
> 
> Imagine a magical photo album where every photo captures the ENTIRE state of your room. If you break something, you can travel back to any photo and restore the room exactly as it was. **Git** is that photo album for code — every commit is a snapshot. You can go back to ANY point, create parallel timelines (branches), and merge them.

### Core Concepts

```
Working Directory ──(git add)──> Staging Area ──(git commit)──> Local Repo ──(git push)──> Remote Repo
      │                              │                             │                          │
 Your files as              Files ready to             Committed              Pushed to
 you edit them              be committed               snapshots              GitHub/GitLab
```

```bash
# ═══════ ESSENTIAL COMMANDS ═══════

# Setup
git init                                    # Initialize new repo
git clone https://github.com/user/repo.git  # Clone existing repo

# Basic workflow
git status                           # See what's changed
git add .                            # Stage all changes
git add file.java                    # Stage specific file
git commit -m "Add user login API"   # Commit with message
git push origin main                 # Push to remote

# History
git log --oneline -10                # Last 10 commits, compact
git log --graph --all --oneline      # Visual branch graph
git diff                             # See unstaged changes
git diff --staged                    # See staged changes

# Undo
git checkout -- file.java            # Discard changes in working dir
git reset HEAD file.java             # Unstage a file
git revert abc1234                   # Create new commit that undoes abc1234
git reset --soft HEAD~1              # Undo last commit, keep changes staged
git reset --hard HEAD~1              # Undo last commit, DELETE changes ⚠️
```

---

## Branching Strategies

### Git Flow

```
main     ────●────────────────●───────────────●────── (production releases)
              \              / \              /
hotfix         \    ────●───   \    ────●───
                \  /            \  /
develop  ────●───●───●───●───●───●───●───●───────── (integration branch)
              \       /   \       /
feature/       ──●──●     ──●──●
login            (feature branches)
```

```bash
# Feature branch workflow
git checkout develop                     # Start from develop
git checkout -b feature/user-login       # Create feature branch
# ... make changes, commit ...
git push origin feature/user-login       # Push to remote
# Create Pull Request on GitHub
# After review & approval:
git checkout develop
git merge feature/user-login             # Merge into develop
git branch -d feature/user-login         # Delete feature branch
```

### Trunk-Based Development (Simpler)

```
main ────●────●────●────●────●────●────── (everyone commits to main)
              │         │
     short-lived    short-lived
     feature        feature
     (< 1 day)      (< 1 day)
```

| Strategy    | Team Size | Release Cycle         | Complexity |
| ----------- | --------- | --------------------- | ---------- |
| Git Flow    | Large     | Scheduled releases    | High       |
| GitHub Flow | Medium    | Continuous deployment | Medium     |
| Trunk-Based | Any       | CI/CD                 | Low        |

---

## Git Workflow for Teams

### Commit Message Convention

```
type(scope): subject

body (optional)

footer (optional)

Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting (no code change)
refactor: Code restructuring
test:     Adding tests
chore:    Build/tooling changes

Examples:
feat(auth): add JWT refresh token endpoint
fix(order): resolve null pointer in payment calculation
docs(readme): add API documentation link
refactor(user): extract validation to separate service
```

### Pull Request Best Practices

```markdown
## Description
Added JWT refresh token endpoint to extend user sessions without re-login.

## Changes
- Added `POST /api/auth/refresh` endpoint
- Created `RefreshTokenService` for token rotation
- Added refresh token table migration (V5)

## Testing
- Unit tests for RefreshTokenService (5 tests)
- Integration test for refresh flow
- Manual test with Postman

## Screenshots
[if UI changes]
```

---

## Advanced Git Commands

```bash
# Stash — save changes temporarily
git stash                     # Stash current changes
git stash list                # See all stashes
git stash pop                 # Apply and remove latest stash
git stash apply stash@{2}     # Apply specific stash

# Rebase — cleaner history (linear, no merge commits)
git checkout feature/login
git rebase main               # Replay feature commits on top of main
# ⚠️ NEVER rebase shared/public branches!

# Interactive rebase — squash/reorder commits
git rebase -i HEAD~3          # Edit/squash last 3 commits

# Cherry-pick — apply a specific commit
git cherry-pick abc1234       # Apply commit abc1234 to current branch

# Bisect — find which commit introduced a bug
git bisect start
git bisect bad                 # Current commit is broken
git bisect good v1.0           # v1.0 was working
# Git does binary search through commits
# You test each and say: git bisect good / git bisect bad

# Tags — mark releases
git tag v1.0.0
git tag -a v1.0.0 -m "First stable release"
git push origin --tags
```

---

## Logging in Java — SLF4J & Logback

> 📋 **Story: The Flight Black Box**
> 
> Every airplane has a black box that records everything — altitude, speed, engine status, pilot conversations. When something goes wrong, investigators use the black box to understand what happened. **Logging** is your application's black box — when production crashes at 3 AM, logs are your only clue.

```java
// File: UserService.java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    // SLF4J → interface; Logback → implementation (Spring Boot default)
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    // Or with Lombok: @Slf4j on the class

    public User getUserById(Long id) {
        log.debug("Fetching user with ID: {}", id); // {} = placeholder (no string concat!)

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException(id));

            log.info("User found: {} (email: {})", user.getName(), user.getEmail());
            return user;

        } catch (UserNotFoundException e) {
            log.warn("User not found: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error fetching user {}: {}", id, e.getMessage(), e);
            // Pass exception as LAST argument → full stack trace is logged
            throw e;
        }
    }

    @Transactional
    public User createUser(CreateUserRequest request) {
        log.info("Creating user with email: {}", request.getEmail());
        // ... business logic ...
        log.info("User created successfully: ID={}", user.getId());
        return user;
    }
}
```

**Log Levels (from most to least verbose):**

| Level   | When to use             | Example                            |
| ------- | ----------------------- | ---------------------------------- |
| `TRACE` | Very detailed debugging | Loop iteration values              |
| `DEBUG` | Debugging info          | Method entry/exit, parameters      |
| `INFO`  | Normal operations       | User created, order placed         |
| `WARN`  | Something unusual       | Deprecated API used, retry attempt |
| `ERROR` | Something BROKE         | Database down, unhandled exception |

### Logback Configuration

```xml
<!-- File: src/main/resources/logback-spring.xml -->
<configuration>
    <!-- Console output (development) -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- File output (production) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/application.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/app.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory> <!-- Keep 30 days of logs -->
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Set levels per package -->
    <logger name="com.abhishek" level="DEBUG"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/> <!-- See SQL queries -->
    <logger name="org.springframework" level="INFO"/>

    <!-- Root level -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

## Structured Logging

```java
// Structured logging with MDC (Mapped Diagnostic Context)
// MDC adds context to EVERY log line in the current thread

@Component
public class RequestFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", requestId);
        MDC.put("userId", getCurrentUserId(request));

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear(); // Always clean up!
        }
    }
}

// logback pattern includes MDC:
// %d [%X{requestId}] [%X{userId}] %-5level %logger - %msg%n
// Output: 2024-01-15 10:30:45 [a1b2c3d4] [user123] INFO UserService - User found: Amit
```

---

## Centralized Logging (ELK Stack)

```
ELK Stack for Microservices:

Microservice 1 ──┐          ┌──────────────┐     ┌────────────┐     ┌──────────┐
Microservice 2 ──┼────────> │  Logstash    │────>│Elasticsearch│────>│ Kibana   │
Microservice 3 ──┘          │ (Collector)  │     │ (Search DB) │     │ (UI)     │
                            └──────────────┘     └────────────┘     └──────────┘

Logstash:        Collects, parses, and transforms logs
Elasticsearch:   Stores and indexes logs (full-text search)
Kibana:          Web UI for searching, visualizing, and dashboarding
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between `git merge` and `git rebase`?**

**A:** `merge` creates a MERGE COMMIT that combines two branches — preserves full history but makes it non-linear. `rebase` REPLAYS commits from one branch on top of another — creates linear history but rewrites commits. Rule: rebase YOUR OWN branches, merge PUBLIC branches. Never rebase shared branches.

---

### Medium-Hard Questions

**Q2: What are the SOLID logging practices for production systems?**

**A:**

1. Use log levels correctly (not everything is ERROR)
2. Include context — user ID, request ID, order ID
3. Use MDC for request-scoped context
4. NEVER log sensitive data (passwords, tokens, PII)
5. Use structured logging (JSON format) for machine parsing
6. Set up log rotation (prevent disk full)
7. Centralize logs for microservices (ELK/Grafana)
8. Use correlation IDs to trace requests across services

**Q3: What is git rebase vs cherry-pick? When to use each?**

**A:** `rebase` replays ALL commits from one branch onto another (entire branch update). `cherry-pick` applies a SPECIFIC single commit to another branch. Use rebase to keep a feature branch up-to-date with main. Use cherry-pick to bring a specific bug fix from one branch to another.

---

> 🎯 **Session 23 Summary:** You've mastered Git workflows (branching strategies, commit conventions, PRs, advanced commands), logging best practices (SLF4J, log levels, MDC, structured logging), and centralized logging (ELK stack). These are essential operational skills for any professional backend developer!
