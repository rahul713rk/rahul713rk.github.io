---
title: "Session 6 & 7: Maven Project Management and Plugins"
description: "Step 6 of Java Backend Guide: Session 6 & 7: Maven Project Management and Plugins."
date: 2026-03-09
tags: [Java Backend Guide, guide]
guide: "Java Backend Guide"
order: 6
---

---

## Table of Contents

1. [Understanding the Need for Maven](#understanding-the-need-for-maven)
2. [POM.xml — The Heart of Maven](#pomxml--the-heart-of-maven)
3. [Maven Repositories](#maven-repositories)
4. [Maven Lifecycle Management](#maven-lifecycle-management)
5. [Maven Plugins](#maven-plugins)
6. [Creating Projects with Archetypes](#creating-projects-with-archetypes)
7. [Dependency Management & Scopes](#dependency-management--scopes)
8. [Multi-Module Maven Projects](#multi-module-maven-projects)
9. [Complete Project: Setting Up a Spring Boot Project with Maven](#complete-project)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Understanding the Need for Maven

> 🏗️ **Story: Building a House Without & With a Contractor**
> 
> Imagine building a house WITHOUT a contractor:
> 
> - You personally drive to 15 different suppliers to buy bricks, cement, pipes, wiring
> - You track all the quantities and compatibility yourself (does this pipe fit that valve?)
> - You manually coordinate: foundation first, then walls, then roof, then wiring
> - If a supplier changes their brick size, all your calculations break
> 
> Now imagine having a **contractor** (Maven):
> 
> - You give the contractor a **spec sheet** (`pom.xml`): "I need these materials, in these versions"
> - The contractor **fetches everything** from trusted suppliers (Maven repositories)
> - The contractor follows a **fixed process**: foundation → walls → roof → inspection (lifecycle)
> - If a material version changes, you update ONE line in the spec sheet
> 
> **Maven** is your project contractor — it manages **dependencies**, **build lifecycle**, and **project structure**.

### The Problems Maven Solves

| Problem               | Without Maven                                     | With Maven                                       |
| --------------------- | ------------------------------------------------- | ------------------------------------------------ |
| **Dependencies**      | Manually download JARs, add to classpath          | Declare in `pom.xml`, auto-downloaded            |
| **Transitive deps**   | Library A needs B, which needs C — track manually | Maven resolves automatically                     |
| **Build process**     | Write custom scripts for compile, test, package   | Standard lifecycle: `mvn package`                |
| **Project structure** | Every project has different layout                | Standard layout everyone knows                   |
| **Sharing code**      | Copy JAR files around                             | Publish to repository, others declare dependency |

---

## POM.xml — The Heart of Maven

> 📋 **Story: The Recipe Card**
> 
> Every dish in a professional kitchen has a **recipe card** listing: the dish name, ingredients with exact quantities, cooking steps, and serving instructions. The POM (Project Object Model) is your project's recipe card — it tells Maven EVERYTHING about how to build your project.

### Anatomy of a POM.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- POM Model Version (always 4.0.0) -->
    <modelVersion>4.0.0</modelVersion>

    <!-- ═══════ PROJECT COORDINATES (Unique Identity) ═══════ -->
    <!-- Think of it as: Country.City.HouseName.Version -->
    <groupId>com.abhishek</groupId>        <!-- Organization/domain (reversed) -->
    <artifactId>my-java-app</artifactId>   <!-- Project name -->
    <version>1.0.0-SNAPSHOT</version>      <!-- Version (SNAPSHOT = in development) -->
    <packaging>jar</packaging>              <!-- Output type: jar, war, pom -->

    <!-- ═══════ PROJECT INFO ═══════ -->
    <name>My Java Application</name>
    <description>A demo Java application</description>

    <!-- ═══════ PROPERTIES (Variables) ═══════ -->
    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.version>3.2.0</spring-boot.version>
    </properties>

    <!-- ═══════ DEPENDENCIES (Ingredients) ═══════ -->
    <dependencies>
        <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>

        <!-- Lombok — compile-time only -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <scope>provided</scope> <!-- Not included in final JAR -->
        </dependency>

        <!-- JUnit 5 — test only -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope> <!-- Only available during testing -->
        </dependency>
    </dependencies>

    <!-- ═══════ BUILD CONFIGURATION ═══════ -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
            </plugin>
        </plugins>
    </build>
</project>
```

**Key Elements Explained:**

```
┌─────────────────────────────────────────────────────────┐
│  pom.xml Structure                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GAV Coordinates (unique identity)                      │
│  ├── groupId:    com.abhishek                          │
│  ├── artifactId: my-java-app                           │
│  └── version:    1.0.0-SNAPSHOT                        │
│                                                         │
│  Properties (variables for reuse)                       │
│  ├── java.version: 21                                  │
│  └── custom variables                                  │
│                                                         │
│  Dependencies (libraries needed)                        │
│  ├── spring-boot-starter-web (compile)                 │
│  ├── lombok (provided)                                 │
│  └── junit (test)                                      │
│                                                         │
│  Build (how to build)                                   │
│  ├── Plugins                                           │
│  └── Resources                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Maven Repositories

> 📦 **Story: The Supply Chain**
> 
> - **Local Repository** (`~/.m2/repository`) = Your personal warehouse. Maven checks here FIRST. If a library is already downloaded, it's reused instantly.
> - **Central Repository** (`repo.maven.apache.org`) = The global Amazon warehouse. If your local warehouse doesn't have it, Maven orders from here.
> - **Remote/Private Repository** (Nexus, Artifactory) = Your company's private warehouse for internal libraries that shouldn't be published publicly.

```
    Your Project
        │
        ▼
    ┌──────────────────┐
    │  Local Repository │  (~/.m2/repository)
    │  Check here first │
    └──────────────────┘
        │ (not found?)
        ▼
    ┌──────────────────┐
    │ Central Repository│  (repo.maven.apache.org)
    │  Public libraries │
    └──────────────────┘
        │ (not found?)
        ▼
    ┌──────────────────┐
    │ Remote Repository │  (Company Nexus/Artifactory)
    │  Private libraries│
    └──────────────────┘
```

### Configuring a Remote Repository

```xml
<!-- In pom.xml -->
<repositories>
    <repository>
        <id>company-nexus</id>
        <name>Company Nexus Repository</name>
        <url>https://nexus.mycompany.com/repository/maven-public/</url>
    </repository>
</repositories>
```

---

## Maven Lifecycle Management

> 🏭 **Story: The Car Assembly Line**
> 
> In a car factory, the assembly line has fixed stages: **weld frame → install engine → add wiring → paint → test drive → ship**. You can't paint before welding. Each stage MUST complete before the next begins.
> 
> Maven has three built-in lifecycles, each with ordered phases:

### The Three Lifecycles

```
1. DEFAULT LIFECYCLE (most important — builds the project):

   validate → compile → test → package → verify → install → deploy

   ┌──────────┐  ┌──────────┐  ┌──────┐  ┌─────────┐  ┌────────┐  ┌─────────┐  ┌────────┐
   │ validate │→│ compile  │→│ test │→│ package │→│ verify │→│ install │→│ deploy │
   │ Check    │  │ .java →  │  │ Run  │  │ Create  │  │ Check  │  │ Copy to │  │ Upload │
   │ POM      │  │ .class   │  │ JUnit│  │ JAR/WAR │  │ checks │  │ ~/.m2   │  │ remote │
   └──────────┘  └──────────┘  └──────┘  └─────────┘  └────────┘  └─────────┘  └────────┘

2. CLEAN LIFECYCLE:
   pre-clean → clean → post-clean
   (Deletes /target directory)

3. SITE LIFECYCLE:
   pre-site → site → post-site → site-deploy
   (Generates project documentation)
```

### Common Maven Commands

```bash
# Compile source code
mvn compile

# Run tests
mvn test

# Package into JAR/WAR (also runs compile + test)
mvn package

# Install to local repository
mvn install

# Clean + Package (most common combo)
mvn clean package

# Skip tests during build (for speed)
mvn clean package -DskipTests

# Run specific test class
mvn test -Dtest=MyTestClass

# See dependency tree (extremely useful for debugging)
mvn dependency:tree

# Check for dependency updates
mvn versions:display-dependency-updates

# Run Spring Boot app
mvn spring-boot:run
```

---

## Maven Plugins

> 🔌 **Story: The Swiss Army Knife**
> 
> Maven by itself is like a Swiss Army Knife handle. The **plugins** are the individual tools that fold out — a blade (compiler), a screwdriver (surefire for testing), a can opener (jar plugin for packaging). Each lifecycle phase is bound to a specific plugin that does the actual work.

### Phase-to-Plugin Binding

| Lifecycle Phase | Default Plugin          | What It Does                 |
| --------------- | ----------------------- | ---------------------------- |
| `compile`       | `maven-compiler-plugin` | Compiles `.java` to `.class` |
| `test`          | `maven-surefire-plugin` | Runs unit tests              |
| `package`       | `maven-jar-plugin`      | Creates JAR file             |
| `install`       | `maven-install-plugin`  | Copies to `~/.m2`            |
| `deploy`        | `maven-deploy-plugin`   | Uploads to remote repo       |

### Configuring Plugins

```xml
<build>
    <plugins>
        <!-- Compiler Plugin — set Java version -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>21</source>
                <target>21</target>
            </configuration>
        </plugin>

        <!-- Surefire Plugin — configure test execution -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.2</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*Tests.java</include>
                </includes>
            </configuration>
        </plugin>

        <!-- JAR Plugin — customize the manifest -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.3.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>com.abhishek.App</mainClass>
                        <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                    </manifest>
                </archive>
            </configuration>
        </plugin>

        <!-- Shade Plugin — create uber/fat JAR with all dependencies -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.5.1</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals><goal>shade</goal></goals>
                    <configuration>
                        <transformers>
                            <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                <mainClass>com.abhishek.App</mainClass>
                            </transformer>
                        </transformers>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- Spring Boot Plugin — create executable JAR -->
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>3.2.0</version>
        </plugin>
    </plugins>
</build>
```

---

## Creating Projects with Archetypes

> 🍪 **Story: The Cookie Cutter**
> 
> Instead of shaping every cookie by hand, bakers use **cookie cutters** — pre-shaped molds that stamp out consistent cookies instantly. Maven **archetypes** are cookie cutters for projects — pre-built templates that generate a complete project structure with one command.

### Common Archetypes

```bash
# 1. Basic Java Project
mvn archetype:generate \
  -DgroupId=com.abhishek \
  -DartifactId=my-app \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DarchetypeVersion=1.4 \
  -DinteractiveMode=false

# 2. Web Application (WAR)
mvn archetype:generate \
  -DgroupId=com.abhishek \
  -DartifactId=my-web-app \
  -DarchetypeArtifactId=maven-archetype-webapp \
  -DinteractiveMode=false
```

### Standard Maven Project Structure

```
my-app/
├── pom.xml                           # The recipe card
├── src/
│   ├── main/
│   │   ├── java/                     # Application source code
│   │   │   └── com/abhishek/
│   │   │       └── App.java
│   │   └── resources/                # Config files, properties
│   │       └── application.properties
│   └── test/
│       ├── java/                     # Test source code
│       │   └── com/abhishek/
│       │       └── AppTest.java
│       └── resources/                # Test config files
│           └── test-data.json
└── target/                           # Build output (generated)
    ├── classes/                      # Compiled .class files
    ├── test-classes/                 # Compiled test classes
    └── my-app-1.0-SNAPSHOT.jar       # Packaged artifact
```

---

## Dependency Management & Scopes

### Dependency Scopes

```xml
<dependencies>
    <!-- COMPILE (default): Available everywhere -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <scope>compile</scope> <!-- This is the default -->
    </dependency>

    <!-- PROVIDED: Available during compile, NOT in final package -->
    <!-- Example: Servlet API provided by Tomcat at runtime -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>provided</scope>
    </dependency>

    <!-- RUNTIME: NOT needed to compile, needed at runtime -->
    <!-- Example: JDBC driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- TEST: Only available in src/test -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

| Scope      | Compile | Test | Runtime | Package |
| ---------- | ------- | ---- | ------- | ------- |
| `compile`  | ✅       | ✅    | ✅       | ✅       |
| `provided` | ✅       | ✅    | ❌       | ❌       |
| `runtime`  | ❌       | ✅    | ✅       | ✅       |
| `test`     | ❌       | ✅    | ❌       | ❌       |

### Dependency Management (Parent POM)

```xml
<!-- Parent POM — defines versions centrally -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Child modules don't need to specify versions -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <!-- version inherited from parent! -->
    </dependency>
</dependencies>
```

### Excluding Transitive Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <!-- Exclude default Tomcat, we'll use Jetty instead -->
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Add Jetty instead -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

---

## Multi-Module Maven Projects

> 🏢 **Story: The Department Store**
> 
> A department store has separate areas: Electronics, Clothing, Groceries. Each area has its own inventory and staff, but they ALL share the same billing system, security, and building infrastructure. Similarly, a multi-module Maven project has a **parent POM** (building infrastructure) and multiple **child modules** (departments).

```
e-wallet-app/  (Parent POM)
├── pom.xml                    ← Parent POM (packaging: pom)
├── common/                    ← Shared utilities
│   ├── pom.xml
│   └── src/
├── user-service/              ← Microservice 1
│   ├── pom.xml
│   └── src/
├── wallet-service/             ← Microservice 2
│   ├── pom.xml
│   └── src/
└── notification-service/       ← Microservice 3
    ├── pom.xml
    └── src/
```

**Parent POM:**

```xml
<project>
    <groupId>com.abhishek</groupId>
    <artifactId>e-wallet-app</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging> <!-- Important! Parent is 'pom' -->

    <modules>
        <module>common</module>
        <module>user-service</module>
        <module>wallet-service</module>
        <module>notification-service</module>
    </modules>

    <properties>
        <java.version>21</java.version>
    </properties>
</project>
```

**Child POM (wallet-service):**

```xml
<project>
    <parent>
        <groupId>com.abhishek</groupId>
        <artifactId>e-wallet-app</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>wallet-service</artifactId>

    <dependencies>
        <!-- Depend on sibling module -->
        <dependency>
            <groupId>com.abhishek</groupId>
            <artifactId>common</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</project>
```

---

## Complete Project: Setting Up a Spring Boot Project with Maven

```bash
# Step 1: Create project structure
mkdir -p my-spring-app/src/main/java/com/abhishek
mkdir -p my-spring-app/src/main/resources
mkdir -p my-spring-app/src/test/java/com/abhishek
```

**pom.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.abhishek</groupId>
    <artifactId>my-spring-app</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>My Spring Boot Application</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

**Application.java:**

```java
// src/main/java/com/abhishek/Application.java
package com.abhishek;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**HelloController.java:**

```java
// src/main/java/com/abhishek/HelloController.java
package com.abhishek;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, String> hello(@RequestParam(defaultValue = "World") String name) {
        return Map.of(
            "message", "Hello, " + name + "!",
            "timestamp", java.time.Instant.now().toString()
        );
    }
}
```

**Build and Run:**

```bash
cd my-spring-app

# Build
mvn clean package

# Run
mvn spring-boot:run

# Or run the JAR directly
java -jar target/my-spring-app-1.0.0-SNAPSHOT.jar

# Test
curl http://localhost:8080/api/hello?name=Abhishek
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is Maven and why is it used?**

**A:** Maven is a build automation and project management tool for Java projects. It standardizes:

1. **Project structure** — convention over configuration
2. **Dependency management** — automatic downloading and version resolution
3. **Build lifecycle** — compile → test → package → deploy with one command
4. **Transitive dependencies** — if A depends on B, and B depends on C, Maven gets C automatically

Before Maven, developers manually managed JARs, wrote makefiles/Ant scripts, and had inconsistent project layouts.

---

**Q2: What is the difference between `mvn install` and `mvn deploy`?**

**A:**

- `mvn install` — compiles, tests, packages, and copies the artifact to your **local** `~/.m2/repository`. Other projects on your machine can now use it as a dependency.
- `mvn deploy` — does everything `install` does, PLUS uploads the artifact to a **remote** repository (Nexus, Artifactory). Team members can now access it.

---

**Q3: What is a SNAPSHOT version?**

**A:** A SNAPSHOT version (e.g., `1.0.0-SNAPSHOT`) means the project is under active development. Maven treats SNAPSHOT artifacts specially:

- Maven re-downloads SNAPSHOT dependencies from the remote repo every build (or at configured intervals), because the content might have changed.
- Release versions (e.g., `1.0.0`) are immutable — once published, they never change.
- Move from SNAPSHOT to release when the code is stable and ready for production.

---

### Medium-Hard Questions

**Q4: How does Maven resolve dependency conflicts when two libraries need different versions of the same dependency?**

**A:** Maven uses two strategies:

1. **Nearest Definition Wins:** The version closest to your project in the dependency tree is used. Your direct dependencies win over transitive ones.
2. **First Declaration Wins:** Among equidistant dependencies, the one declared FIRST in the POM wins.

To debug: `mvn dependency:tree` shows the full tree. To force a version:

```xml
<!-- Option 1: Declare it directly (becomes nearest) -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.0</version>
</dependency>

<!-- Option 2: Use dependencyManagement (overrides all) -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

**Q5: What is the difference between `<dependencies>` and `<dependencyManagement>`?**

**A:**

- `<dependencies>` — directly adds the dependency to the current project. It's downloaded and available.
- `<dependencyManagement>` — only DECLARES the version centrally. It does NOT add the dependency. Child modules must still declare the dependency in their `<dependencies>`, but they INHERIT the version from `<dependencyManagement>`.

This is powerful in multi-module projects: define versions once in the parent, all children are consistent. If you need to update a library version, change ONE line in the parent POM.

---

**Q6: Explain the Maven lifecycle phase ordering. If you run `mvn package`, which phases execute?**

**A:** Maven phases run in order. `mvn package` triggers ALL phases UP TO and including `package`:

1. `validate` — check POM, project structure
2. `compile` — compile `src/main/java` to `target/classes`
3. `test-compile` — compile `src/test/java`
4. `test` — run tests via Surefire plugin
5. `package` — create JAR/WAR in `target/`

Phases AFTER `package` (like `verify`, `install`, `deploy`) do NOT run. Each phase only runs if all previous phases succeed — a failed test stops the build before packaging.

---

> 🎯 **Sessions 6 & 7 Summary:** You now understand why Maven exists, how POM.xml structures your project, the three Maven lifecycles, dependency scopes and conflict resolution, plugin configuration, archetypes for project generation, and multi-module projects. Maven is the backbone of every Java backend project — mastering it makes you more productive as a developer!
