# Copilot Chat OpenAI Proxy - Architectural Documentation

## Executive Summary

The **Copilot Chat OpenAI Proxy** is a VS Code extension providing a REST API proxy server that routes OpenAI-compatible requests through GitHub Copilot's language models.

**Key Features:**
- ✅ OpenAI API-compatible interface
- ✅ Zero OpenAI API key required
- ✅ Local development server (localhost:8080)
- ✅ Built-in Swagger UI documentation
- ✅ Multi-model support via GitHub Copilot
- ✅ Tool calls (MCP) support

---

## 1. System Architecture Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph "External Clients"
        A[OpenAI Client<br/>Python/JS/curl]
    end
    
    subgraph "VS Code Extension"
        B[Express REST API<br/>localhost:8080]
        C[Chat Participant<br/>Handler]
        D[Swagger UI<br/>/api-docs]
    end
    
    subgraph "VS Code Platform"
        E[Language Model API<br/>vscode.lm]
        F[GitHub Copilot<br/>Extension]
    end
    
    subgraph "GitHub Services"
        G[Copilot Models<br/>gpt-4o, claude-3.5]
    end
    
    A -->|POST /v1/chat/completions| B
    A -->|GET /api-docs| D
    B --> C
    C --> E
    E --> F
    F --> G
    G -->|Response Stream| F
    F --> E
    E --> C
    C --> B
    B -->|OpenAI JSON| A
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style F fill:#e8f5e9
    style G fill:#f3e5f5
```

### Technology Stack

```mermaid
graph LR
    subgraph "Core Technologies"
        A[TypeScript 4.9.5]
        B[Node.js]
        C[Express.js 4.21]
        D[VS Code API 1.95+]
    end
    
    subgraph "Key Dependencies"
        E[OpenAI SDK 4.53]
        F[Swagger UI Express]
        G[JSON Schema Validator]
    end
    
    subgraph "Build Tools"
        H[Webpack 5.76]
        I[vsce 2.31]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    C --> F
    C --> G
    A --> H
    H --> I
    
    style C fill:#c8e6c9
    style D fill:#bbdefb
    style H fill:#ffccbc
```

---

## 2. Component Architecture

### Component Diagram

```mermaid
graph TB
    subgraph "Extension Core"
        A[extension.ts<br/>Entry Point]
        B[chatHandler.ts<br/>Request Router]
    end
    
    subgraph "Command Layer"
        C[ChatCommandHandler<br/>Abstract Base]
        D[LlmproxyStartHandler<br/>Proxy Implementation]
    end
    
    subgraph "REST API"
        E[Express Server]
        F[OpenAPI Spec]
        G[Request Validator]
        H[Swagger UI]
    end
    
    subgraph "Integration"
        I[VS Code LM API]
        J[Copilot Models]
        K[Tool Support MCP]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> G
    E --> H
    E --> F
    D --> I
    I --> J
    I --> K
    
    style A fill:#ffccbc
    style D fill:#c8e6c9
    style E fill:#bbdefb
    style I fill:#f8bbd0
```

---

## 3. Data Flow Architecture

### Request Flow - Chat Completion

```mermaid
sequenceDiagram
    participant Client as OpenAI Client
    participant Express as Express Server
    participant Handler as Handler
    participant Validator as Validator
    participant VSCode as VS Code LM
    participant Copilot as GitHub Copilot
    
    Client->>Express: POST /v1/chat/completions
    Express->>Validator: validate(request)
    
    alt Invalid Request
        Validator-->>Express: errors
        Express-->>Client: 400 Bad Request
    else Valid Request
        Validator-->>Handler: OK
        Handler->>Handler: Select model
        Handler->>Handler: Transform messages
        Handler->>VSCode: sendRequest(messages, options)
        VSCode->>Copilot: Forward to LLM
        
        loop Stream chunks
            Copilot-->>VSCode: chunk
            VSCode-->>Handler: TextPart/ToolCallPart
            Handler->>Handler: Accumulate
        end
        
        Handler->>Handler: Format OpenAI response
        Handler-->>Express: response
        Express-->>Client: 200 OK + JSON
    end
```

### Tool Call Flow (MCP)

```mermaid
sequenceDiagram
    participant Client
    participant Handler
    participant VSCode
    participant Copilot
    
    Client->>Handler: Request with tools[]
    Handler->>Handler: Transform to LM tools
    Handler->>VSCode: sendRequest(messages, {tools})
    VSCode->>Copilot: Process with tools
    Copilot-->>VSCode: ToolCallPart chunk
    VSCode-->>Handler: Tool call data
    Handler->>Handler: Format as OpenAI tool_calls
    Handler-->>Client: finish_reason: "tool_calls"
    
    Client->>Client: Execute tool locally
    Client->>Handler: New request + tool result
    Handler->>VSCode: Continue with result
    VSCode->>Copilot: Process tool result
    Copilot-->>Handler: Final response
    Handler-->>Client: finish_reason: "stop"
```

---

## 4. User Interaction Flows

### Starting the Proxy Server

```mermaid
graph TD
    A[User Opens VS Code] --> B[Extension Activated]
    B --> C[User Opens Chat Panel]
    C --> D["Types '@llmproxy /start'"]
    D --> E[Chat Handler Routes]
    E --> F{Pre-flight Check}
    F -->|Fail| G[Show Error]
    F -->|Pass| H[Start Express Server]
    H --> I[Server Listening :8080]
    I --> J[Display Success Message]
    J --> K[User Clicks URL]
    K --> L[Browser Opens Swagger UI]
    
    style D fill:#bbdefb
    style H fill:#fff9c4
    style L fill:#c8e6c9
```

### API Request Journey

```mermaid
stateDiagram-v2
    [*] --> ServerStarted: @llmproxy /start
    ServerStarted --> ClientSetup: Configure client
    ClientSetup --> SendRequest: create()
    SendRequest --> Validate: Express receives
    Validate --> Invalid: Fails
    Validate --> Process: Passes
    Invalid --> [*]: 400 error
    Process --> SelectModel
    SelectModel --> NotFound: Invalid model
    SelectModel --> Invoke: Valid model
    NotFound --> [*]: 400 error
    Invoke --> Stream: Call Copilot
    Stream --> Format: Complete
    Format --> [*]: 200 OK
```

---

## 5. Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Network Security"
        A[Localhost Only]
        B[Configurable Port]
    end
    
    subgraph "Authentication"
        C[No API Key Required]
        D[Copilot Auth Used]
        E[VS Code Sandbox]
    end
    
    subgraph "Data Security"
        F[JSON Schema Validation]
        G[Input Sanitization]
        H[Error Handling]
    end
    
    subgraph "Code Security"
        I[TypeScript Type Safety]
        J[Dependency Updates]
        K[ESLint Checks]
    end
    
    A --> Security
    C --> Security
    F --> Security
    I --> Security
    Security[Secure Architecture]
    
    style Security fill:#c8e6c9
```

### Threat Mitigation

```mermaid
graph LR
    T1[Unauthorized<br/>Access] -->|Mitigated by| M1[Localhost<br/>Binding]
    T2[Data<br/>Injection] -->|Mitigated by| M2[Schema<br/>Validation]
    T3[DoS<br/>Attack] -->|Mitigated by| M3[Copilot<br/>Rate Limiting]
    T4[Vulnerable<br/>Dependencies] -->|Mitigated by| M4[Regular<br/>npm audit]
    
    style T1 fill:#ffcdd2
    style T2 fill:#ffcdd2
    style T3 fill:#ffcdd2
    style T4 fill:#ffcdd2
    style M1 fill:#c8e6c9
    style M2 fill:#c8e6c9
    style M3 fill:#c8e6c9
    style M4 fill:#c8e6c9
```

---

## 6. Deployment Architecture

### Build & Package Pipeline

```mermaid
graph TD
    A[TypeScript Source] --> B[Type Check]
    B --> C[Webpack Bundle]
    C --> D[Copy Swagger UI]
    D --> E[vsce Package .vsix]
    E --> F{Deploy Target}
    F --> G[Manual Install]
    F --> H[VS Code Marketplace]
    F --> I[Open VSX]
    F --> J[Private Registry]
    
    style A fill:#bbdefb
    style C fill:#fff9c4
    style E fill:#c8e6c9
```

### Runtime Architecture

```mermaid
graph TB
    subgraph "VS Code Extension Host"
        A[Extension Runtime]
        B[Express HTTP Server]
        C[Port :8080]
    end
    
    subgraph "VS Code Main"
        D[Chat API]
        E[Language Model API]
    end
    
    subgraph "External"
        F[Copilot Extension]
        G[HTTP Clients]
    end
    
    A --> B
    B --> C
    A --> D
    D --> E
    E --> F
    G --> C
    
    style B fill:#fff9c4
    style E fill:#c8e6c9
```

---

## 7. API Architecture

### REST API Endpoints

```mermaid
graph TB
    A["GET /v1/chat/models"] --> B[List Available Models]
    C["POST /v1/chat/completions"] --> D[Create Chat Completion]
    E["GET /api-docs"] --> F[Swagger UI Documentation]
    
    B --> G[200 OK: models[]]
    D --> H{Process}
    H --> I[200 OK: completion]
    H --> J[400: validation error]
    H --> K[500: server error]
    
    style C fill:#bbdefb
    style I fill:#c8e6c9
    style J fill:#ffccbc
    style K fill:#ffccbc
```

### Message Transformation

```mermaid
graph LR
    A[OpenAI Message] --> B{Role}
    B -->|user| C[LM.User]
    B -->|assistant| D[LM.Assistant]
    B -->|system| D
    B -->|tool| E[LM.User + context]
    
    C --> F[sendRequest]
    D --> F
    E --> F
    F --> G[Copilot]
    G --> H[Stream Chunks]
    H --> I{Type}
    I -->|TextPart| J[Accumulate text]
    I -->|ToolCallPart| K[Create tool_calls]
    J --> L[OpenAI Response]
    K --> L
    
    style A fill:#bbdefb
    style F fill:#fff9c4
    style L fill:#c8e6c9
```

---

## 8. Extension Lifecycle

### Activation Flow

```mermaid
sequenceDiagram
    participant VS as VS Code
    participant Ext as Extension
    participant Handler as Handlers
    participant Chat as Chat Participant
    
    VS->>Ext: activate(context)
    Ext->>Ext: setExtensionContext
    Ext->>Ext: setDisplayNameLogging
    Ext->>Chat: createChatParticipant
    Chat-->>Ext: participant instance
    Ext->>Handler: registerIntentHandlers
    Handler->>Handler: Register "start" command
    Ext->>Chat: onDidReceiveFeedback
    Ext-->>VS: Activation complete
```

### Command Execution

```mermaid
graph TD
    A[Extension Activate] --> B[Register Handlers]
    B --> C[Map: start -> Handler]
    
    D[User: @llmproxy /start] --> E[chatHandler]
    E --> F{Command exists?}
    F -->|No| G[Error: No handler]
    F -->|Yes| H[Get handler]
    H --> I[preFlightCheck]
    I -->|Fail| J[Show error]
    I -->|Pass| K[preProcess]
    K --> L[process]
    L --> M[postProcess]
    M --> N[Display result]
    
    style L fill:#c8e6c9
    style N fill:#f8bbd0
```

---

## 9. Design Patterns

### Patterns Used

```mermaid
graph TB
    subgraph "Structural"
        A[Adapter<br/>OpenAI ↔ VS Code]
        B[Facade<br/>Express Interface]
    end
    
    subgraph "Behavioral"
        C[Strategy<br/>Command Handlers]
        D[Template Method<br/>Process Pipeline]
        E[Chain of Responsibility<br/>Request Handlers]
    end
    
    subgraph "Creational"
        F[Singleton<br/>Extension Context]
        G[Factory<br/>Participant Creation]
    end
    
    style A fill:#bbdefb
    style C fill:#fff9c4
    style F fill:#c8e6c9
```

### Class Hierarchy

```mermaid
classDiagram
    class ChatCommandHandler {
        <<abstract>>
        +name: string
        +getSetting(key) string
        +preFlightCheck()* CheckResult
        +preProcess()* Promise
        +process()* Promise
        +postProcess()* Promise
    }
    
    class LlmproxyStartHandler {
        +name = "start"
        -httpServer: Server
        +preFlightCheck() CheckResult
        +preProcess() Promise
        +process() Promise
        +postProcess() Promise
    }
    
    class VSCodeElements {
        +request: ChatRequest
        +context: ChatContext
        +stream: ResponseStream
        +token: CancellationToken
    }
    
    ChatCommandHandler <|-- LlmproxyStartHandler
    ChatCommandHandler ..> VSCodeElements
```

---

## 10. Performance & Scalability

### Latency Breakdown

```mermaid
graph TB
    A[Client → Express<br/>1-5ms] --> Total
    B[Schema Validation<br/>1-2ms] --> Total
    C[Model Selection<br/><1ms] --> Total
    D[VS Code → Copilot<br/>100-500ms] --> Total
    E[Stream Processing<br/>10-100ms] --> Total
    F[JSON Formatting<br/>1-2ms] --> Total
    Total[Total: 120-610ms]
    
    style D fill:#ffccbc
    style Total fill:#c8e6c9
```

### Scalability Considerations

```mermaid
graph LR
    subgraph "Current"
        A[Single Instance]
        B[Localhost Only]
        C[Sync Processing]
    end
    
    subgraph "Future"
        D[Multi-Instance]
        E[Network Access]
        F[Async Queue]
    end
    
    A -.-> D
    B -.-> E
    C -.-> F
    
    style A fill:#ffccbc
    style D fill:#c8e6c9
```

---

## Summary

This architecture provides a robust, secure, and extensible proxy solution that:

1. **Bridges APIs**: Seamlessly translates OpenAI API calls to VS Code Language Model API
2. **Leverages Existing Auth**: Uses GitHub Copilot's authentication infrastructure
3. **Ensures Security**: Localhost-only binding with schema validation
4. **Provides Documentation**: Integrated Swagger UI for API exploration
5. **Supports Advanced Features**: Tool calls (MCP), multiple models, streaming

The extension follows VS Code best practices and design patterns, ensuring maintainability and extensibility for future enhancements.
