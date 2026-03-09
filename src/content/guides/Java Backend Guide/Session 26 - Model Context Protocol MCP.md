# Session 26: Model Context Protocol (MCP) — Fundamentals & Implementation

---

## Table of Contents

1. [What is Model Context Protocol (MCP)?](#what-is-mcp)
2. [Why MCP? The "Universal Translator" Analogy](#why-mcp)
3. [MCP Architecture: Clients, Servers, and Tools](#mcp-architecture)
4. [Understanding Tools in MCP](#understanding-tools-in-mcp)
5. [Implementing a Java MCP Server](#implementing-a-java-mcp-server)
6. [Connecting MCP Server with Cursor](#connecting-with-cursor)
7. [Debugging and Testing MCP Servers](#debugging-mcp)
8. [Best Practices for MCP Development](#best-practices)
9. [Interview Questions & Answers](#interview-questions--answers)

---

## What is Model Context Protocol (MCP)?

> 🌐 **The Definition**
> 
> **Model Context Protocol (MCP)** is an open-standard protocol that allows AI models (like Claude, Gemini, or GPT) to securely and efficiently interact with external data and tools. It was introduced by Anthropic to solve a major problem: AI models are powerful but they are "trapped in a box" without access to your local files, databases, or private APIs unless we build custom integrations for every single one.

---

## Why MCP? The "Universal Translator" Analogy

> 🗣️ **Story: The Tower of Babel vs. The Universal Translator**
> 
> Imagine you have 5 different AI assistants (Claude, Cursor, ChatGPT, etc.) and you want them all to access your Company's Internal Database. Without MCP, you would have to write 5 different "plugins" or "connectors." 
> 
> **MCP is like a Universal Translator.** You write **ONE** MCP Server that knows how to read your database. Now, ANY AI Client that speaks MCP (like Cursor) can plug into that server and instantly understand how to query your data. One server, infinite AI integrations.

---

## MCP Architecture

MCP follows a simple **Client-Server** model:

1. **MCP Client:** The application the user interacts with (e.g., **Cursor**, Claude Desktop).
2. **MCP Server:** A small program (written in Java, Node.js, or Python) that exposes specific capabilities.
3. **Transport:** How they talk (usually via Standard Input/Output or HTTP/SSE).

```
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   MCP Client     │          │   MCP Server     │          │   External Data  │
│   (e.g. Cursor)  │ <──────> │ (Your Java App)  │ <──────> │ (DB, API, Files) │
└──────────────────┘    ↑     └──────────────────┘          └──────────────────┘
                 Model Context 
                   Protocol
```

---

## Understanding Tools in MCP

Tools are the "actions" an AI can take. When you define a tool in MCP, you are giving the AI "hands."

**A Tool definition includes:**

* **Name:** `query_customer_database`
* **Description:** "Use this to look up customer orders by email."
* **Input Schema:** JSON definition of required parameters (e.g., `email` string).

> 💡 **Key Concept:** The AI doesn't just "see" the data; it **decides** to call a tool based on your prompt. If you ask "What did user X order?", the AI sees your `query_customer_database` tool description and decides to invoke it.

---

## Implementing a Java MCP Server

While many MCP servers use Node.js, you can build them in **Java** using the Spring AI MCP SDK.

**Step 1: Dependency (Conceptual)**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-server-spring-boot-starter</artifactId>
</dependency>
```

**Step 2: Defining a Tool bean**

```java
@Configuration
public class McpConfig {

    @Bean
    public McpTool databaseTool(CustomerRepository repo) {
        return McpTool.builder()
            .name("get_customer_details")
            .description("Retrieves customer info and order history from the DB")
            .inputSchema(Map.of(
                "email", "string"
            ))
            .handler(args -> {
                String email = (String) args.get("email");
                return repo.findByEmail(email).toString();
            })
            .build();
    }
}
```

---

## Connecting MCP Server with Cursor

**Cursor** is one of the most powerful MCP clients. Here is how you connect your server to it:

1. **Open Cursor Settings:** `Ctrl + Shift + J` (or go to Settings -> Features -> MCP).

2. **Add New MCP Server:**
   
   * **Name:** `MyJavaTool`
   
   * **Type:** `command` (for local executable) or `sse` (for a running web server).
   
   * **Command:** If it's a JAR file:
     
     ```bash
     java -jar /path/to/your/mcp-server.jar
     ```
   
   * **Env Variables:** Add any required DB passwords or API keys.

3. **Click Save:** Cursor will start the process. If you see a **Green Dot**, the AI now has access to your custom tools!

---

## Debugging and Testing MCP Servers

* **Logs:** Since many MCP servers use StdOut for protocol messages, use **StdErr** for your own logs so you don't break the protocol.
* **MCP Inspector:** Anthropic provides a tool called `@modelcontextprotocol/inspector` (via npx) that lets you test your server in a web UI before connecting it to Cursor.

```bash
npx @modelcontextprotocol/inspector java -jar my-mcp-server.jar
```

---

## Best Practices

1. **Limit Scope:** Don't give an MCP tool full "delete" permissions unless absolutely necessary.
2. **Clear Descriptions:** The AI's ability to use a tool depends 100% on how well you describe it. Use "Search for customers by name" instead of just "search."
3. **Error Handling:** If a DB query fails, return a helpful error message to the AI so it can explain it to the user.
4. **Security:** MCP servers run locally. Ensure you aren't exposing sensitive system files via tools.

---

## Interview Questions & Answers

### Conceptual

**Q1: What is the core difference between an API and an MCP Server?**

**A:** An **API** is designed for software-to-software communication where the caller (developer) knows exactly what endpoint to hit. An **MCP Server** is designed for **LLM-to-Software** communication. It provides metadata (descriptions and schemas) that allow the AI to *decide* which tool to use and how to format the request dynamically.

**Q2: How does MCP solve the "Context Window" problem?**

**A:** Instead of stuffing thousands of lines of documentation or database rows into the prompt (exhausting the context window), MCP allows the AI to **fetch only what it needs, when it needs it** via tools and resources. This keeps the prompt clean and efficient.

---

### Medium-Hard

**Q3: Explain the "SSE" transport vs "Stdio" transport in MCP.**

**A:** 

* **Stdio (Standard Input/Output):** The client starts the server as a child process and sends/receives messages via text streams. This is best for local tools (e.g., local file system access).
* **SSE (Server-Sent Events):** The client connects to a persistent HTTP endpoint. This is better for remote tools or servers that need to be shared across multiple clients/users.

**Q4: If an MCP tool call returns a very large dataset (e.g., 10,000 JSON objects), how should the MCP server handle it?**

**A:** The server should implement **Pagination** or **Summarization**. Returning massive amounts of data can overwhelm the AI's context window. The best practice is to return a summary or the first 50 results and offer a "next_page" tool to fetch more.

---

> 🎯 **Session 26 Summary:** You've mastered the cutting edge! You now understand the Model Context Protocol (MCP), how to define tools, how to build a server in Java, and how to connect it to **Cursor** to supercharge your AI-driven development.
