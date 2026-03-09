# Session 18: Testing in Spring Boot

---

## Table of Contents

1. [Why Testing Matters](#why-testing-matters)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing with JUnit 5](#unit-testing-with-junit-5)
4. [Mocking with Mockito](#mocking-with-mockito)
5. [Testing Service Layer](#testing-service-layer)
6. [Testing Controllers with MockMvc](#testing-controllers-with-mockmvc)
7. [Integration Testing with @SpringBootTest](#integration-testing)
8. [Testing JPA Repositories with @DataJpaTest](#testing-jpa-repositories)
9. [Test Containers for Database Testing](#test-containers)
10. [Interview Questions & Answers](#interview-questions--answers)

---

## Why Testing Matters

> 🧪 **Story: The Pharmaceutical Lab**
> 
> A pharmaceutical company doesn't ship medicine without testing it first — every batch is tested in the lab (unit test), then on animals (integration test), then in clinical trials (end-to-end test). Shipping untested medicine can be FATAL.
> 
> Similarly, shipping untested code to production can crash your system, lose customer data, or expose security vulnerabilities. Tests are your safety net.

---

## Testing Pyramid

```
                    ┌───────────┐
                    │  E2E /    │  ← Slow, expensive, few
                    │  UI Tests │
                   ┌┴───────────┴┐
                   │ Integration  │  ← Medium speed, moderate count
                   │ Tests        │
                  ┌┴──────────────┴┐
                  │   Unit Tests    │  ← Fast, cheap, MANY
                  └────────────────┘
```

| Type            | What it tests                    | Speed      | Dependencies    | Tools                  |
| --------------- | -------------------------------- | ---------- | --------------- | ---------------------- |
| **Unit**        | Single method/class in isolation | ⚡ ms       | Mocked          | JUnit, Mockito         |
| **Integration** | Multiple components together     | 🐢 seconds | Real (DB, etc.) | @SpringBootTest        |
| **E2E**         | Full system, user perspective    | 🐌 minutes | Everything      | Selenium, REST Assured |

---

## Unit Testing with JUnit 5

```java
// File: CalculatorTest.java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach // Runs before EACH test method
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    @DisplayName("Should add two positive numbers")
    void testAddPositiveNumbers() {
        assertEquals(5, calculator.add(2, 3));
    }

    @Test
    @DisplayName("Should handle division by zero")
    void testDivideByZero() {
        assertThrows(ArithmeticException.class, () -> calculator.divide(10, 0));
    }

    @Test
    @DisplayName("Should return negative for subtraction of larger from smaller")
    void testSubtract() {
        int result = calculator.subtract(3, 7);
        assertTrue(result < 0, "Result should be negative");
        assertEquals(-4, result);
    }

    // Parameterized test — test multiple inputs
    @ParameterizedTest
    @CsvSource({"1, 1, 2", "5, 3, 8", "-1, 1, 0", "0, 0, 0"})
    @DisplayName("Should add various numbers correctly")
    void testAddParameterized(int a, int b, int expected) {
        assertEquals(expected, calculator.add(a, b));
    }

    @Test
    @DisplayName("Should verify string is not empty")
    void testAssertions() {
        String name = "Abhishek";

        assertAll("grouped assertions",
            () -> assertNotNull(name),
            () -> assertEquals("Abhishek", name),
            () -> assertTrue(name.startsWith("A")),
            () -> assertFalse(name.isEmpty())
        );
    }
}
```

**Key Annotations:**
| Annotation | Purpose |
|-----------|---------|
| `@Test` | Marks a test method |
| `@BeforeEach` | Runs before each test |
| `@AfterEach` | Runs after each test |
| `@BeforeAll` | Runs once before all tests (static method) |
| `@DisplayName` | Human-readable test name |
| `@Disabled` | Skip this test |
| `@ParameterizedTest` | Run same test with different inputs |

---

## Mocking with Mockito

> 🎭 **Story: The Movie Stunt Double**
> 
> In movies, the hero doesn't jump off buildings — a **stunt double** does it. The camera sees the same face (same interface), but the behavior is controlled. **Mocking** replaces real dependencies with stunt doubles whose behavior you control.

```java
// File: UserServiceTest.java
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class) // Enable Mockito
class UserServiceTest {

    @Mock // Create a mock (fake) UserRepository
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks // Create UserService and inject the mocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "Amit", "amit@example.com");
    }

    @Test
    @DisplayName("Should return user when found by ID")
    void testGetUserById_Success() {
        // ARRANGE — define mock behavior
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // ACT — call the method under test
        User result = userService.getUserById(1L);

        // ASSERT — verify the result
        assertNotNull(result);
        assertEquals("Amit", result.getName());
        assertEquals("amit@example.com", result.getEmail());

        // VERIFY — ensure the mock was called correctly
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testGetUserById_NotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));
        verify(userRepository).findById(99L);
    }

    @Test
    @DisplayName("Should create user and send welcome email")
    void testCreateUser() {
        when(userRepository.existsByEmail("amit@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.createUser(testUser);

        assertNotNull(result);
        assertEquals("Amit", result.getName());

        // Verify email was sent
        verify(emailService).sendWelcomeEmail("amit@example.com", "Amit");
        // Verify repository.save was called with any User
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should reject duplicate email")
    void testCreateUser_DuplicateEmail() {
        when(userRepository.existsByEmail("amit@example.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> userService.createUser(testUser));

        // Verify save was NEVER called (because validation failed)
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendWelcomeEmail(anyString(), anyString());
    }
}
```

---

## Testing Controllers with MockMvc

```java
// File: UserControllerTest.java
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class) // Load ONLY the web layer for this controller
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc; // Simulates HTTP requests

    @MockBean // Spring-aware mock (replaces bean in app context)
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/users/1 should return user")
    void testGetUser() throws Exception {
        User user = new User(1L, "Amit", "amit@example.com");
        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Amit"))
                .andExpect(jsonPath("$.email").value("amit@example.com"));
    }

    @Test
    @DisplayName("GET /api/users/99 should return 404")
    void testGetUser_NotFound() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new UserNotFoundException("User not found"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/users should create user")
    void testCreateUser() throws Exception {
        User newUser = new User(null, "Priya", "priya@example.com");
        User savedUser = new User(1L, "Priya", "priya@example.com");
        when(userService.createUser(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Priya"));
    }

    @Test
    @DisplayName("POST /api/users with invalid data should return 400")
    void testCreateUser_ValidationError() throws Exception {
        String invalidJson = "{\"name\": \"\", \"email\": \"not-an-email\"}";

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
```

---

## Integration Testing with @SpringBootTest

```java
// File: UserIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate; // Real HTTP calls

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll(); // Clean slate
    }

    @Test
    @DisplayName("Full flow: create user → get user → update → delete")
    void testFullUserCrud() {
        // CREATE
        User newUser = new User("Amit", "amit@test.com");
        ResponseEntity<User> createResponse = restTemplate.postForEntity(
                "/api/users", newUser, User.class);

        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        User created = createResponse.getBody();
        assertNotNull(created.getId());

        // READ
        ResponseEntity<User> getResponse = restTemplate.getForEntity(
                "/api/users/" + created.getId(), User.class);
        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertEquals("Amit", getResponse.getBody().getName());

        // UPDATE
        created.setName("Amit Sharma");
        restTemplate.put("/api/users/" + created.getId(), created);

        // VERIFY UPDATE
        User updated = restTemplate.getForObject("/api/users/" + created.getId(), User.class);
        assertEquals("Amit Sharma", updated.getName());

        // DELETE
        restTemplate.delete("/api/users/" + created.getId());
        ResponseEntity<User> afterDelete = restTemplate.getForEntity(
                "/api/users/" + created.getId(), User.class);
        assertEquals(HttpStatus.NOT_FOUND, afterDelete.getStatusCode());
    }
}
```

---

## Testing JPA Repositories with @DataJpaTest

```java
// File: UserRepositoryTest.java
@DataJpaTest // Loads ONLY JPA components (entities, repos) — fast!
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager; // Direct entity management for test setup

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should find user by email")
    void testFindByEmail() {
        // Setup test data
        User user = new User("Amit", "amit@test.com");
        entityManager.persistAndFlush(user);

        // Execute
        Optional<User> found = userRepository.findByEmail("amit@test.com");

        // Verify
        assertTrue(found.isPresent());
        assertEquals("Amit", found.get().getName());
    }

    @Test
    @DisplayName("Should return empty for non-existent email")
    void testFindByEmail_NotFound() {
        Optional<User> found = userRepository.findByEmail("nobody@test.com");
        assertTrue(found.isEmpty());
    }

    @Test
    @DisplayName("Custom query should find active users by department")
    void testFindActiveByDepartment() {
        entityManager.persistAndFlush(new User("A", "a@t.com", "Engineering", true));
        entityManager.persistAndFlush(new User("B", "b@t.com", "Engineering", false));
        entityManager.persistAndFlush(new User("C", "c@t.com", "Marketing", true));

        List<User> result = userRepository.findByDepartmentAndIsActiveTrue("Engineering");

        assertEquals(1, result.size());
        assertEquals("A", result.get(0).getName());
    }
}
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between `@Mock` and `@MockBean`?**

**A:** `@Mock` (Mockito) creates a plain mock object — used in unit tests WITHOUT Spring context. `@MockBean` (Spring Boot Test) creates a mock AND replaces the actual bean in the Spring ApplicationContext — used in integration tests with `@SpringBootTest` or `@WebMvcTest`. `@MockBean` is slower because it restarts the context.

---

**Q2: What is the difference between `@WebMvcTest` and `@SpringBootTest`?**

**A:** `@WebMvcTest` loads ONLY the web layer (controllers, filters, advice) — fast, uses `MockMvc`. `@SpringBootTest` loads the ENTIRE application context (all beans, real DB, etc.) — slow, uses `TestRestTemplate` for real HTTP calls. Use `@WebMvcTest` for controller unit tests, `@SpringBootTest` for end-to-end integration tests.

---

### Medium-Hard Questions

**Q3: How do you test a method that depends on time (e.g., token expiry)?**

**A:** Inject a `Clock` or time abstraction:

```java
@Service
public class TokenService {
    private final Clock clock;

    public TokenService(Clock clock) { this.clock = clock; }

    public boolean isExpired(Token token) {
        return Instant.now(clock).isAfter(token.getExpiresAt());
    }
}

// In test:
Clock fixedClock = Clock.fixed(Instant.parse("2024-01-15T10:00:00Z"), ZoneOffset.UTC);
TokenService service = new TokenService(fixedClock);
// Now time is frozen — deterministic tests!
```

---

**Q4: What is the difference between `verify()` and `assert` in Mockito?**

**A:** `assert` checks the RESULT — "did the method return the right value?" `verify()` checks BEHAVIOR — "was this mock method called with the right arguments the expected number of times?" Both are needed: assert validates output, verify ensures correct interactions with dependencies.

---

> 🎯 **Session 18 Summary:** You've mastered the testing pyramid, JUnit 5 (assertions, lifecycle, parameterized tests), Mockito (mocking, stubbing, verification), controller testing (MockMvc), integration testing (@SpringBootTest), and repository testing (@DataJpaTest). Tests are not optional — they're the foundation of reliable software!
