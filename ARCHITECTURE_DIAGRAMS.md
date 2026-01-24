# RepairPro - System Architecture Diagram

This file contains the complete sytem architecture diagram in Mermaid format.

## Complete System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Frontend Application - React 19 + TypeScript + Vite"
        direction TB
        
        subgraph "Entry Point"
            Main[main.tsx]
            App[App.tsx]
        end
        
        subgraph "Views/Pages"
            Home[Home]
            Services[Services]
            About[About]
            Contact[Contact]
            Cart[Cart]
            Quote[Quote Requests]
            Workers[Worker Map]
            Inventory[Inventory]
            Feedback[Feedback]
            Admin[Admin Dashboard]
            Auth[Auth Views]
        end
        
        subgraph "Components"
            Layouts[Layouts]
            Shared[Shared Components]
            Template[Template]
            UI[UI Primitives]
        end
        
        subgraph "State Management - Zustand"
            AuthStore[Auth Store]
            CartStore[Cart Store]
            ThemeStore[Theme Store]
            LocaleStore[Locale Store]
            CurrencyStore[Currency Store]
        end
        
        subgraph "Services Layer"
            AuthService[Auth Service]
            APIService[API Service]
            WorkerService[Worker Service]
            AgentService[Agent Service]
            HealthService[Health Service]
        end
        
        subgraph "Core Systems"
            AuthSystem[Authentication]
            i18n[i18next]
            Router[React Router]
        end
        
        Main --> App
        App --> Router
        Router --> Views
        Views --> Layouts
        Layouts --> Shared
        Shared --> Template
        Template --> UI
        Views --> State Management
        Views --> Services Layer
        Services Layer --> Core Systems
    end
    
    subgraph "Backend Server - Node.js + Express"
        direction TB
        
        subgraph "Server"
            ExpressServer[Express Server<br/>Port 3001]
        end
        
        subgraph "API Routes"
            AgentRoute[/api/agent<br/>Secure Proxy]
            WorkersRoute[/api/workers<br/>Worker Management]
            InventoryRoute[/api/inventory<br/>Inventory CRUD]
            EventsRoute[/api/events<br/>SSE Events]
            UploadsRoute[/api/uploads<br/>File Uploads]
        end
        
        subgraph "Middleware"
            ValidateAgent[Validate Agent Request]
            CORS[CORS Handler]
            BodyParser[Body Parser]
        end
        
        subgraph "Utilities"
            AgentPolicy[Agent Policy]
            SafeFetch[Safe Fetch]
            SSE[SSE Utils]
            DB[Database Utils]
            InventoryService[Inventory Service]
        end
        
        subgraph "Data Storage"
            JSONData[inventory.json]
            FileSystem[File System]
        end
        
        ExpressServer --> Middleware
        Middleware --> API Routes
        API Routes --> Utilities
        Utilities --> Data Storage
    end
    
    subgraph "External Services"
        Firebase[Firebase Auth]
        LeafletMaps[Leaflet Maps]
        OpenAI[OpenAI API<br/>via Agent Proxy<br/>Secured with host allowlist]
    end
    
    subgraph "Future Integrations"
        PayPal[PayPal SDK]
        MercadoLibre[Mercado Libre API]
        EmailService[Email Notifications]
        SMSService[SMS Notifications]
        SocketIO[Socket.io<br/>Real-time Updates]
        AIModels[AI/ML Models]
    end
    
    Browser --> Main
    Mobile --> Main
    
    Services Layer -->|HTTP/REST| ExpressServer
    AuthSystem --> Firebase
    Workers --> LeafletMaps
    AgentRoute --> OpenAI
    
    ExpressServer -.->|Planned| PayPal
    ExpressServer -.->|Planned| MercadoLibre
    ExpressServer -.->|Planned| EmailService
    ExpressServer -.->|Planned| SMSService
    ExpressServer -.->|Planned| SocketIO
    ExpressServer -.->|Planned| AIModels
    
    style Browser fill:#e3f2fd
    style Mobile fill:#e3f2fd
    style Main fill:#ffecb3
    style ExpressServer fill:#c8e6c9
    style AuthSystem fill:#ffcdd2
    style State Management fill:#f3e5f5
    style Services Layer fill:#e1f5fe
    style API Routes fill:#c5e1a5
    style Firebase fill:#fff9c4
    style LeafletMaps fill:#b2dfdb
```

### External Services Details

#### OpenAI Integration (via Agent Proxy)
The application uses a secure Agent Proxy endpoint to communicate with OpenAI API:
- **Endpoint**: `/api/agent` (POST)
- **Security**: Host allowlist enforced (`api.openai.com`, `*.openai.azure.com`)
- **Features**: Supports both JSON responses and Server-Sent Events (SSE) streaming
- **Guardrails**: Request/response size limits, header sanitization, timeout protection
- **Authentication**: Authorization headers are redacted from logs for security
- **Use Case**: Powers the AI chatbot component for customer support

For more details on the Agent Proxy security features, see the backend README.

## Detailed Component Architecture

```mermaid
graph LR
    subgraph "Component Hierarchy"
        direction TB
        
        App[App.tsx<br/>Main Application] --> AuthProvider[AuthProvider<br/>Auth Context]
        AuthProvider --> Router[React Router<br/>Route Configuration]
        
        Router --> PreLoginLayout[PreLoginLayout<br/>Public Pages]
        Router --> PostLoginLayout[PostLoginLayout<br/>Protected Pages]
        Router --> AuthLayout[AuthLayout<br/>Auth Pages]
        
        PreLoginLayout --> HomePage[Home]
        PreLoginLayout --> ServicesPage[Services]
        PreLoginLayout --> AboutPage[About]
        PreLoginLayout --> ContactPage[Contact]
        
        PostLoginLayout --> AdminPage[Admin Dashboard]
        PostLoginLayout --> WorkersPage[Worker Management]
        PostLoginLayout --> InventoryPage[Inventory]
        PostLoginLayout --> CartPage[Cart]
        PostLoginLayout --> QuotePage[Quote Requests]
        PostLoginLayout --> FeedbackPage[Feedback]
        PostLoginLayout --> EnterprisePage[Enterprise]
        
        AuthLayout --> SignIn[Sign In]
        AuthLayout --> SignUp[Sign Up]
        AuthLayout --> ForgotPassword[Forgot Password]
        AuthLayout --> ResetPassword[Reset Password]
        
        PostLoginLayout --> Header[Header]
        PostLoginLayout --> SideNav[SideNav]
        PostLoginLayout --> Footer[Footer]
        
        Header --> UserProfile[User Profile]
        Header --> HealthStatus[Health Status]
        Header --> Chatbot[Chatbot]
        Header --> Logo[Logo]
        
        SideNav --> VerticalMenu[Vertical Menu]
        VerticalMenu --> MenuItems[Menu Items]
    end
    
    style App fill:#e74c3c,color:#fff
    style AuthProvider fill:#f39c12,color:#fff
    style Router fill:#3498db,color:#fff
    style PostLoginLayout fill:#2ecc71,color:#fff
    style PreLoginLayout fill:#1abc9c,color:#fff
    style AuthLayout fill:#9b59b6,color:#fff
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend UI
    participant Store as Zustand Store
    participant Service as Frontend Service
    participant Axios as Axios Client
    participant API as Backend API
    participant DB as Data Storage
    participant External as External Services
    
    User->>UI: User Action
    UI->>Store: Read/Update State
    UI->>Service: Call Service Method
    Service->>Axios: HTTP Request
    Axios->>API: REST API Call
    
    alt Backend Processing
        API->>DB: Read/Write Data
        DB-->>API: Data Response
    else External Service
        API->>External: External API Call
        External-->>API: External Response
    end
    
    API-->>Axios: HTTP Response
    Axios-->>Service: Data
    Service->>Store: Update State
    Store-->>UI: State Change
    UI-->>User: UI Update
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant SignIn as Sign In Page
    participant AuthService as Auth Service
    participant Firebase
    participant AuthStore as Auth Store
    participant Router as React Router
    participant Protected as Protected Pages
    
    User->>SignIn: Enter Credentials
    SignIn->>AuthService: signIn(email, password)
    AuthService->>Firebase: authenticate
    
    alt Success
        Firebase-->>AuthService: Access Token + User Data
        AuthService->>AuthStore: setUser(userData)
        AuthService->>AuthStore: setToken(token)
        AuthStore-->>SignIn: Authentication Success
        SignIn->>Router: Navigate to Dashboard
        Router->>Protected: Render Protected Route
        Protected-->>User: Show Dashboard
    else Failure
        Firebase-->>AuthService: Error
        AuthService-->>SignIn: Error Message
        SignIn-->>User: Show Error
    end
```

## Service Request Workflow

```mermaid
graph TD
    Start[User Visits Site] --> Browse[Browse Services]
    Browse --> SelectService[Select Service]
    SelectService --> AddCart[Add to Cart]
    AddCart --> MoreServices{More Services?}
    MoreServices -->|Yes| SelectService
    MoreServices -->|No| ViewCart[View Cart]
    ViewCart --> RequestQuote[Request Quote]
    RequestQuote --> FillForm[Fill Quote Form]
    FillForm --> Submit[Submit Request]
    Submit --> BackendProcess[Backend Processing]
    BackendProcess --> AssignWorker[Assign Worker]
    AssignWorker --> NotifyWorker[Notify Worker]
    NotifyWorker --> WorkerConfirm{Worker Confirms?}
    WorkerConfirm -->|Yes| SendQuote[Send Quote to User]
    WorkerConfirm -->|No| ReassignWorker[Reassign to Another Worker]
    ReassignWorker --> NotifyWorker
    SendQuote --> UserReview[User Reviews Quote]
    UserReview --> Accept{Accept Quote?}
    Accept -->|Yes| Schedule[Schedule Service]
    Accept -->|No| End[End]
    Schedule --> Complete[Service Completed]
    Complete --> Feedback[Submit Feedback]
    Feedback --> Loyalty[Earn Loyalty Points]
    Loyalty --> End
    
    style Start fill:#2ecc71
    style Complete fill:#3498db
    style End fill:#e74c3c
```

## Worker Location System

```mermaid
graph TB
    subgraph "Worker Location System"
        WorkerApp[Worker Mobile App]
        Location[GPS Location Service]
        Backend[Backend API]
        Database[Worker Location DB]
        Frontend[Frontend Map View]
        Leaflet[Leaflet Maps]
        
        WorkerApp -->|Send Location| Location
        Location -->|Update| Backend
        Backend -->|Store| Database
        Frontend -->|Request Workers| Backend
        Backend -->|Return Locations| Frontend
        Frontend -->|Render Markers| Leaflet
        Leaflet -->|Display Map| User[User Browser]
    end
    
    style WorkerApp fill:#4a90e2
    style Backend fill:#50c878
    style Frontend fill:#f39c12
    style Leaflet fill:#2ecc71
```

## State Management Flow

```mermaid
graph LR
    subgraph "Zustand Stores"
        direction TB
        
        AS[Auth Store<br/>User, Token, Permissions]
        CS[Cart Store<br/>Items, Total, Quantities]
        TS[Theme Store<br/>Mode, Colors, Layout]
        LS[Locale Store<br/>Language, Translations]
        CUS[Currency Store<br/>Currency, Rates]
        RS[Route Key Store<br/>Navigation Keys]
    end
    
    subgraph "Components"
        Header[Header Components]
        Pages[Page Components]
        Shared[Shared Components]
    end
    
    AS --> Header
    AS --> Pages
    
    CS --> Header
    CS --> Pages
    
    TS --> Header
    TS --> Pages
    TS --> Shared
    
    LS --> Header
    LS --> Pages
    LS --> Shared
    
    CUS --> Pages
    CUS --> Header
    
    RS --> Pages
    
    style AS fill:#e74c3c,color:#fff
    style CS fill:#3498db,color:#fff
    style TS fill:#9b59b6,color:#fff
    style LS fill:#2ecc71,color:#fff
    style CUS fill:#f39c12,color:#fff
    style RS fill:#1abc9c,color:#fff
```

## API Architecture

```mermaid
graph TB
    subgraph "Frontend Services"
        AuthSvc[AuthService]
        APISvc[ApiService]
        WorkerSvc[WorkerService]
        AgentSvc[AgentService]
        HealthSvc[HealthService]
    end
    
    subgraph "HTTP Layer"
        AxiosBase[Axios Base Config]
        ReqInterceptor[Request Interceptor]
        ResInterceptor[Response Interceptor]
    end
    
    subgraph "Backend Routes"
        Agent[/api/agent]
        Workers[/api/workers]
        Inventory[/api/inventory]
        Events[/api/events]
        Uploads[/api/uploads]
    end
    
    subgraph "Backend Middleware"
        Validate[Validate Agent Request]
        CORSMid[CORS Middleware]
        BodyParser[Body Parser]
    end
    
    subgraph "Backend Utils"
        SafeFetch[Safe Fetch]
        AgentPolicy[Agent Policy]
        SSEUtils[SSE Utils]
        DBUtils[DB Utils]
        InvService[Inventory Service]
    end
    
    AuthSvc --> AxiosBase
    APISvc --> AxiosBase
    WorkerSvc --> AxiosBase
    AgentSvc --> AxiosBase
    HealthSvc --> AxiosBase
    
    AxiosBase --> ReqInterceptor
    ReqInterceptor --> ResInterceptor
    ResInterceptor --> Backend Routes
    
    Backend Routes --> Backend Middleware
    Backend Middleware --> Backend Utils
    
    style Frontend Services fill:#e1f5fe
    style HTTP Layer fill:#fff9c4
    style Backend Routes fill:#c5e1a5
    style Backend Middleware fill:#ffccbc
    style Backend Utils fill:#d1c4e9
```

## Technology Stack Overview

```mermaid
mindmap
  root((RepairPro<br/>Tech Stack))
    Frontend
      Core
        React 19
        TypeScript
        Vite 6
      Styling
        Tailwind CSS 4
        Framer Motion
      State
        Zustand
      Routing
        React Router
      Forms
        React Hook Form
        Zod Validation
      Maps
        Leaflet
        React Leaflet
      i18n
        i18next
        react-i18next
      HTTP
        Axios
        SWR
    Backend
      Runtime
        Node.js
      Framework
        Express
      Features
        SSE
        Agent Proxy
        File Uploads
      Storage
        JSON Files
        File System
    Auth
      Firebase Auth
      JWT Tokens
    Future
      PayPal
      Mercado Libre
      Email/SMS
      Socket.io
      AI/ML Models
```
