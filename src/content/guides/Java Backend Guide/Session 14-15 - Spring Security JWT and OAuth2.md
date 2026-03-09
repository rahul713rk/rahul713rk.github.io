# Session 14 & 15: Spring Security, JWT & OAuth2

---

## Table of Contents

1. [Why Security Matters](#why-security-matters)
2. [Spring Security Architecture](#spring-security-architecture)
3. [Authentication vs Authorization](#authentication-vs-authorization)
4. [Configuring Spring Security](#configuring-spring-security)
5. [Password Encoding](#password-encoding)
6. [JWT (JSON Web Token)](#jwt-json-web-token)
7. [Implementing JWT Authentication](#implementing-jwt-authentication)
8. [OAuth2 Concepts](#oauth2-concepts)
9. [Role-Based Access Control (RBAC)](#role-based-access-control)
10. [Complete Project: Secure REST API with JWT](#complete-project)
11. [Interview Questions & Answers](#interview-questions--answers)

---

## Why Security Matters

> 🏰 **Story: The Medieval Castle**
> 
> Imagine a medieval castle protecting a kingdom's treasure:
> 
> - **Moat & Walls** = Firewall and network security (outside Spring's scope)
> - **Castle Gate** = The entry point where guards check everyone (Spring Security filter chain)
> - **Identity Check** = "WHO are you?" — show your passport (Authentication)
> - **Authorization Check** = "ARE you allowed in the treasury?" — check your rank (Authorization)
> - **Guards at every door** = Security filters on every request
> 
> Without security, anyone can walk into your castle and steal the treasure (data). Spring Security is your army of automated guards.

---

## Spring Security Architecture

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│               SECURITY FILTER CHAIN                       │
│                                                          │
│  ┌──────────────────┐                                    │
│  │ CorsFilter       │ → CORS headers                    │
│  └────────┬─────────┘                                    │
│           ▼                                              │
│  ┌──────────────────┐                                    │
│  │ CsrfFilter       │ → CSRF protection                 │
│  └────────┬─────────┘                                    │
│           ▼                                              │
│  ┌──────────────────────────┐                            │
│  │ UsernamePasswordAuth     │  (or JwtAuthFilter)        │
│  │ Filter                   │ → Extract credentials      │
│  └────────┬─────────────────┘                            │
│           ▼                                              │
│  ┌──────────────────────────┐                            │
│  │ AuthenticationManager    │                            │
│  │ ├── AuthProvider 1       │ → Validate credentials     │
│  │ └── AuthProvider 2       │                            │
│  └────────┬─────────────────┘                            │
│           ▼                                              │
│  ┌──────────────────────────┐                            │
│  │ AuthorizationFilter      │ → Check roles/permissions  │
│  └────────┬─────────────────┘                            │
│           ▼                                              │
│  ┌──────────────────────────┐                            │
│  │ ExceptionTranslation     │ → Handle 401/403           │
│  │ Filter                   │                            │
│  └────────┬─────────────────┘                            │
└───────────┼──────────────────────────────────────────────┘
            ▼
    DispatcherServlet → Controller
```

---

## Authentication vs Authorization

| Aspect       | Authentication (AuthN)        | Authorization (AuthZ)        |
| ------------ | ----------------------------- | ---------------------------- |
| **Question** | WHO are you?                  | WHAT can you do?             |
| **Method**   | Username/password, JWT, OAuth | Roles, permissions           |
| **When**     | Before authorization          | After authentication         |
| **Failure**  | 401 Unauthorized              | 403 Forbidden                |
| **Example**  | Logging in to Gmail           | Only admins can delete users |

---

## Configuring Spring Security

**pom.xml:**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

```java
// File: SecurityConfig.java
package com.abhishek.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @Secured
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for REST APIs (stateless — no session)
            .csrf(csrf -> csrf.disable())

            // Stateless session management (no cookies, no server-side session)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // URL-based authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no authentication needed
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Role-based access
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Industry-standard password hashing
    }
}
```

---

## Password Encoding

> 🔐 **Story: The Secret Recipe Vault**
> 
> A restaurant NEVER stores recipes in plain text on the kitchen whiteboard — anyone could steal them. Instead, they use a **safe** that scrambles the recipe. When a chef needs to verify a recipe, they put their version into the safe — if it matches the scrambled version, it's correct. This is **hashing** — you can verify without ever seeing the original.

```java
// File: PasswordEncoderDemo.java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderDemo {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String rawPassword = "MySecretPassword123";

        // Hash the password (one-way — cannot be reversed!)
        String hashed = encoder.encode(rawPassword);
        System.out.println("Raw:    " + rawPassword);
        System.out.println("Hashed: " + hashed);
        // Output: $2a$10$randomSaltHere...60chars...

        // Verify: does raw password match the hash?
        System.out.println("Match: " + encoder.matches(rawPassword, hashed)); // true
        System.out.println("Match: " + encoder.matches("WrongPassword", hashed)); // false

        // IMPORTANT: Each call to encode() produces a DIFFERENT hash (random salt)
        String hashed2 = encoder.encode(rawPassword);
        System.out.println("Same password, different hash: " + hashed2);
        System.out.println("But matches() still works: " + encoder.matches(rawPassword, hashed2));
    }
}
```

**NEVER store plain-text passwords.** Always use bcrypt, argon2, or scrypt.

---

## JWT (JSON Web Token)

> 📮 **Story: The Theme Park Wristband**
> 
> When you enter a theme park, they check your ticket (authentication) and give you a **wristband** (JWT). The wristband has your name, ticket type (VIP/Regular), and expiry time — all ENCODED on the band. Now at every ride, the staff just scans your wristband — no need to go back to the entry gate!
> 
> JWT = the wristband. It contains your identity, is signed (tamper-proof), and has an expiry. The server doesn't need to store sessions — all info is IN the token.

### JWT Structure

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbWl0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsiVVNFUiJdLCJpYXQiOjE3MDUyNDE2MDAsImV4cCI6MTcwNTMyODAwMH0.abc123signature

┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  {                                                       │
│    "alg": "HS256",     ← Signing algorithm              │
│    "typ": "JWT"                                          │
│  }                                                       │
├─────────────────────────────────────────────────────────┤
│  PAYLOAD (Claims)                                        │
│  {                                                       │
│    "sub": "amit@example.com",  ← Subject (user)         │
│    "roles": ["USER"],          ← Custom claim            │
│    "iat": 1705241600,          ← Issued at              │
│    "exp": 1705328000           ← Expiration             │
│  }                                                       │
├─────────────────────────────────────────────────────────┤
│  SIGNATURE                                               │
│  HMACSHA256(                                             │
│    base64(header) + "." + base64(payload),               │
│    secretKey                                             │
│  )                                                       │
│  → Ensures token hasn't been tampered with!              │
└─────────────────────────────────────────────────────────┘
```

### JWT Authentication Flow

```
1. Login Request
   POST /api/auth/login  { "email": "amit@ex.com", "password": "pass123" }
        │
        ▼
2. Server validates credentials
   ├── Load user from DB
   ├── Compare password hash (BCrypt)
   └── If valid → generate JWT token
        │
        ▼
3. Response: { "token": "eyJhbGci..." }
   Client stores this token (localStorage, httpOnly cookie)
        │
        ▼
4. Subsequent Requests
   GET /api/books
   Header: Authorization: Bearer eyJhbGci...
        │
        ▼
5. JwtAuthFilter intercepts EVERY request
   ├── Extract token from Authorization header
   ├── Validate signature & expiry
   ├── Extract user info from claims
   └── Set SecurityContext (user is authenticated)
        │
        ▼
6. Controller processes request normally
```

---

## Implementing JWT Authentication

**pom.xml:**

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

```java
// File: JwtService.java
package com.abhishek.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours default
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Generate JWT token
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Extract username from token
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Check if token is valid
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

// File: JwtAuthFilter.java
package com.abhishek.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Extract Authorization header
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 2: Extract token
        String token = authHeader.substring(7); // Remove "Bearer "

        try {
            // Step 3: Extract username
            String username = jwtService.extractUsername(token);

            // Step 4: If not already authenticated
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Step 5: Validate token
                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                        );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Step 6: Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Invalid token — don't authenticate
            logger.error("JWT validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## OAuth2 Concepts

> 🏨 **Story: The Hotel Key Card**
> 
> When you check into a hotel (Google/GitHub), the front desk (Authorization Server) gives you a **key card** (access token). This key card:
> 
> - Opens YOUR room (accesses your data)
> - Doesn't work on other rooms (limited scope)  
> - Expires at checkout time (token expiry)
> - Can access the pool if you paid for it (specific scopes: email, profile, repos)
> 
> The room service (Resource Server/Your API) trusts the key card because it came from the front desk — no need for your passport every time.

### OAuth2 Roles

```
┌──────────────────────────────────────────────────────────────┐
│  1. Resource Owner     → The user (you)                       │
│  2. Client             → Your application (wants access)      │
│  3. Authorization Srv  → Google/GitHub (issues tokens)        │
│  4. Resource Server    → API that has the protected data      │
└──────────────────────────────────────────────────────────────┘

OAuth2 Authorization Code Flow:

User                    Your App                  Google
  │                       │                         │
  │ 1. "Login with Google"│                         │
  │──────────────────────>│                         │
  │                       │ 2. Redirect to Google   │
  │                       │────────────────────────>│
  │                       │                         │
  │ 3. Google login page  │                         │
  │<────────────────────────────────────────────────│
  │                       │                         │
  │ 4. User logs in & consents                      │
  │────────────────────────────────────────────────>│
  │                       │                         │
  │                       │ 5. Authorization Code   │
  │                       │<────────────────────────│
  │                       │                         │
  │                       │ 6. Exchange code for    │
  │                       │    access token         │
  │                       │────────────────────────>│
  │                       │                         │
  │                       │ 7. Access Token         │
  │                       │<────────────────────────│
  │                       │                         │
  │ 8. Authenticated!     │ 9. Use token to get     │
  │<──────────────────────│    user info from Google │
```

**Spring Boot OAuth2 Configuration:**

```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: your-google-client-id
            client-secret: your-google-client-secret
            scope: email, profile
          github:
            client-id: your-github-client-id
            client-secret: your-github-client-secret
            scope: user:email
```

---

## Role-Based Access Control (RBAC)

```java
// File: User.java (entity with roles)
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt encoded

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = new HashSet<>();

    // Getters, setters...
}

enum Role {
    ROLE_USER, ROLE_ADMIN, ROLE_MODERATOR
}

// File: Method-level security
@RestController
@RequestMapping("/api")
public class SecuredController {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "Anyone can see this!";
    }

    @GetMapping("/user/profile")
    @PreAuthorize("hasRole('USER')")  // Only authenticated users with ROLE_USER
    public String userProfile() {
        return "User profile page";
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // Only ADMIN
    public String deleteUser(@PathVariable Long id) {
        return "User " + id + " deleted";
    }

    @GetMapping("/mod/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")  // ADMIN or MODERATOR
    public String reports() {
        return "Moderation reports";
    }
}
```

---

## Complete Project: Secure REST API with JWT

```java
// File: AuthController.java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserDetailsService userDetailsService,
                          PasswordEncoder passwordEncoder,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash!
        user.setName(request.getName());
        user.getRoles().add(Role.ROLE_USER);

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully"));
    }

    // Login — returns JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(), request.getPassword()
                )
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
            "token", token,
            "type", "Bearer",
            "email", userDetails.getUsername()
        ));
    }
}

// File: RegisterRequest.java
class RegisterRequest {
    private String name;
    private String email;
    private String password;
    // Getters, setters...
}

// File: LoginRequest.java
class LoginRequest {
    private String email;
    private String password;
    // Getters, setters...
}
```

**Testing the secure API:**

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Amit","email":"amit@example.com","password":"pass123"}'

# 2. Login → get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit@example.com","password":"pass123"}'
# Response: {"token": "eyJhbGci...","type":"Bearer","email":"amit@example.com"}

# 3. Access protected endpoint WITH token
curl http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer eyJhbGci..."
# Response: 200 OK

# 4. Access WITHOUT token
curl http://localhost:8080/api/user/profile
# Response: 401 Unauthorized

# 5. User tries admin endpoint
curl -X DELETE http://localhost:8080/api/admin/users/1 \
  -H "Authorization: Bearer eyJhbGci..."
# Response: 403 Forbidden (user doesn't have ADMIN role)
```

---

## Interview Questions & Answers

### Conceptual Questions

**Q1: What is the difference between Authentication and Authorization?**

**A:** Authentication verifies IDENTITY ("Who are you?") — typically via username/password, JWT, or OAuth. If it fails, you get **401 Unauthorized**. Authorization verifies PERMISSIONS ("What can you access?") — based on roles/authorities. If it fails, you get **403 Forbidden**. Authentication always happens BEFORE authorization.

---

**Q2: Why should you NEVER store passwords in plain text?**

**A:** If the database is breached, every password is exposed. Users often reuse passwords across sites, so one breach compromises multiple accounts. BCrypt is the standard:

- One-way hashing (can't reverse)
- Random salt (same password → different hash each time)
- Configurable cost factor (slow to hash → expensive to brute-force)
- Built-in salt storage (no separate salt column needed)

---

### Medium-Hard Questions

**Q3: How does JWT work? What are its security implications?**

**A:** JWT is a self-contained token with three Base64-encoded parts: Header (algorithm), Payload (claims), Signature (proof of integrity). The server signs the token with a secret key. On each request, the server verifies the signature — if valid, the claims are trusted.

**Security implications:**

- JWTs CANNOT be invalidated before expiry (unlike sessions). Solutions: short expiry + refresh tokens, or token blacklist in Redis.
- Never store sensitive data in the payload (it's Base64-encoded, NOT encrypted — anyone can decode it).
- Use HTTPS only (tokens can be intercepted over HTTP).
- Store in httpOnly cookies (not localStorage — vulnerable to XSS).
- Use strong, long secrets (at least 256 bits for HS256).

---

**Q4: What is the difference between session-based and token-based authentication?**

**A:**

| Aspect          | Session-Based                           | Token-Based (JWT)                    |
| --------------- | --------------------------------------- | ------------------------------------ |
| State           | Server stores session                   | Stateless — token contains all info  |
| Storage         | Server: session store; Client: cookie   | Client only (localStorage/cookie)    |
| Scalability     | Sticky sessions or shared session store | Any server can validate              |
| Invalidation    | Easy (delete session)                   | Hard (token is self-contained)       |
| Mobile friendly | ❌ Cookie issues                         | ✅ Token in header                    |
| Microservices   | Needs shared session store              | Each service validates independently |

Token-based is preferred for REST APIs and microservices. Session-based is simpler for traditional web apps.

---

**Q5: Explain the CSRF attack and how Spring Security prevents it.**

**A:** CSRF (Cross-Site Request Forgery): A malicious site tricks your browser into making requests to a legitimate site where you're logged in. Example: You're logged into your bank. You visit a malicious site with a hidden form that submits a transfer request to your bank — your browser automatically includes your session cookie.

Spring Security prevents CSRF by:

1. Generating a unique CSRF token per session
2. Including it in forms as a hidden field
3. Validating the token on every state-changing request (POST, PUT, DELETE)
4. Rejecting requests without a valid CSRF token

For **stateless REST APIs** with JWT, CSRF is typically disabled because there's no session cookie to exploit — tokens are sent in the Authorization header, which malicious sites can't automatically include.

---

> 🎯 **Sessions 14 & 15 Summary:** You've mastered Spring Security architecture (filter chain, authentication manager), password encoding (BCrypt), JWT authentication (generation, validation, filter chain integration), OAuth2 concepts (authorization code flow), and RBAC (role-based method security). Security is NON-NEGOTIABLE for production applications!
