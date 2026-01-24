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
        
        subgraph Views["Views/Pages"]
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
        
        subgraph Components["Components"]
            Layouts[Layouts]
            Shared[Shared Components]
            Template[Template]
            UI[UI Primitives]
        end
        
        subgraph StateManagement["State Management - Zustand"]
            AuthStore[Auth Store]
            CartStore[Cart Store]
            ThemeStore[Theme Store]
            LocaleStore[Locale Store]
            CurrencyStore[Currency Store]
        end
        
        subgraph ServicesLayer["Services Layer"]
            AuthService[Auth Service]
            APIService[API Service]
            WorkerService[Worker Service]
            AgentService[Agent Service]
            HealthService[Health Service]
        end
        
        subgraph CoreSystems["Core Systems"]
            AuthSystem[Authentication]
            i18n[i18next]
            Router[React Router]
        end
        
        Main --> App
        App --> Router
        Router --> Views
        Views --> Components
        Components --> Layouts
        Layouts --> Shared
        Shared --> Template
        Template --> UI
        Views --> StateManagement
        Views --> ServicesLayer
        ServicesLayer --> CoreSystems
    end
    
    subgraph "Backend Server - Node.js + Express"
        direction TB
        
        subgraph Server["Server"]
            ExpressServer[Express Server<br/>Port 3001]
        end
        
        subgraph APIRoutes["API Routes"]
            AgentRoute[/api/agent<br/>Secure Proxy]
            WorkersRoute[/api/workers<br/>Worker Management]
            InventoryRoute[/api/inventory<br/>Inventory CRUD]
            EventsRoute[/api/events<br/>SSE Events]
            UploadsRoute[/api/uploads<br/>File Uploads]
        end
        
        subgraph Middleware["Middleware"]
            ValidateAgent[Validate Agent Request]
            CORS[CORS Handler]
            BodyParser[Body Parser]
        end
        
        subgraph Utilities["Utilities"]
            AgentPolicy[Agent Policy]
            SafeFetch[Safe Fetch]
            SSE[SSE Utils]
            DB[Database Utils]
            InventoryService[Inventory Service]
        end
        
        subgraph DataStorage["Data Storage"]
            JSONData[inventory.json]
            FileSystem[File System]
        end
        
        ExpressServer --> Middleware
        Middleware --> APIRoutes
        APIRoutes --> Utilities
        Utilities --> DataStorage
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
    
    ServicesLayer -->|HTTP/REST| ExpressServer
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
    style StateManagement fill:#f3e5f5
    style ServicesLayer fill:#e1f5fe
    style APIRoutes fill:#c5e1a5
    style Firebase fill:#fff9c4
    style LeafletMaps fill:#b2dfdb