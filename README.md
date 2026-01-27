# RepairPro - Professional Repair Services Application

![IBM Logo](https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg)

A comprehensive web application focused on repair services, installation, and parts supply for home, industrial, and commercial sectors.

## Author

- Marcos Mora — Full Stack Developer (IBM assessment)

## Features

### Service Categories

- ⚡ Electrical Fencing Installation
- 📹 Surveillance Camera Installation
- 🎨 Professional Painting Services
- ❄️ Air Conditioning Repairs & Installation
- 🔧 Preventive Maintenance Programs
- 🚨 Emergency Repair Services

### Customer Features

- 🛒 **Shopping Cart**: User-friendly cart to manage selected services
- 📝 **Quote System**: Request quotes with optional inspection scheduling
- 🗺️ **Worker Map**: Find available workers by zone with real-time location
- ⭐ **Feedback System**: Rate services and earn loyalty points
- 🎁 **Loyalty Program**: Discounts and coupons for repeat customers
- 💬 **Chatbot**: AI-powered customer support assistant

### Admin Features

- 📊 **Admin Dashboard**: Full management of services and requests
- 👷 **Worker Management**: Track workers, availability, and job status
- 📦 **Inventory System**: Track parts and supplies
- 📈 **Real-time Reports**: Job status and worker location tracking

### Technical Features

- 🌐 **Multilingual**: English and Spanish support
- 💱 **Multi-currency**: USD and EUR support
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Animated interfaces with dark mode support

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Internationalization**: i18next
- **Maps**: Leaflet
- **Backend (Planned)**: Node.js, Express

## Agent Proxy (Safe Fetch + Streaming)

This project includes a secure Agent endpoint to safely proxy outbound HTTP requests from the frontend through the backend with strict guardrails and streaming support.

Endpoint

- POST /api/agent
- Modes: JSON (non-stream) and SSE (streaming, default)
- Default streaming uses Server‑Sent Events with a 15s heartbeat; NDJSON fallback is possible if an intermediary blocks SSE.

Environment variables (backend/.env)

- PORT: Backend port (default 3001)
- AGENT_HOST_ALLOWLIST: CSV of allowed hostnames, supports leading wildcard for Azure OpenAI (default: localhost, 127.0.0.1, api.openai.com, *.openai.azure.com)
- AGENT_TIMEOUT_MS: Upstream timeout (default 60000)
- AGENT_MAX_REQ_BODY: Max request body bytes (default 262144)
- AGENT_MAX_NONSTREAM_RESP: Max non‑stream response bytes (default 2097152)
- AGENT_SSE_HEARTBEAT_MS: SSE heartbeat interval ms (default 15000)

Guardrails & limits

- Host allowlist enforced; non‑allowlisted hosts are rejected
- Methods: GET, POST only; POST must be application/json
- Header allowlist: Accept, Content‑Type, Authorization; hop‑by‑hop headers stripped
- Request body cap: 256 KB; non‑stream response cap: 2 MB
- Timeout: 60 seconds; graceful error and stream close
- Secrets: Authorization redacted from logs and never echoed back

Dev proxy

- Vite dev proxy forwards /api → <http://localhost:3001> so the frontend can reach the backend Agent endpoint during development

Usage

- Non‑stream: POST JSON payload to /api/agent and receive a structured JSON response
- Stream: POST with Accept: text/event-stream to /api/agent and consume meta/chunk/done events; heartbeat comments are emitted roughly every 15 seconds

Troubleshooting

- SSE blocked by proxy: enable NDJSON fallback or use non‑stream mode
- 403 forbidden host: add hostname to AGENT_HOST_ALLOWLIST
- 413 payload too large: reduce input or increase AGENT_MAX_REQ_BODY cautiously
- 415 unsupported media type: use application/json for POST
- Timeout: reduce upstream work or increase AGENT_TIMEOUT_MS cautiously

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### Standard Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Installation

For containerized deployment in GitHub Codespaces or Docker-enabled environments:

```bash
# Development mode (with hot reload)
npm run docker:dev

# Production mode
npm run docker:build
npm run docker:prod

# View logs
npm run docker:logs

# Stop containers
npm run docker:stop
```

**Quick Start**: See [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) for immediate Docker usage in Codespaces

**Complete Guide**: See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for comprehensive Docker setup and usage instructions

## Project Structure

```text
src/
├── @types/           # TypeScript types
├── assets/           # Static assets and styles
├── auth/             # Authentication logic
├── components/       # React components
│   ├── layouts/      # Layout components
│   ├── shared/       # Shared components (Chatbot, etc.)
│   ├── template/     # Template components
│   └── ui/           # UI components
├── configs/          # App configuration
├── constants/        # Constants
├── data/             # Static data
├── locales/          # Translations
├── services/         # API services
├── store/            # Zustand stores
├── utils/            # Utility functions
└── views/            # Page components
    ├── about/        # About page
    ├── admin/        # Admin dashboard
    ├── cart/         # Shopping cart
    ├── contact/      # Contact page
    ├── enterprise/   # Enterprise features
    ├── feedback/     # Feedback & loyalty
    ├── inventory/    # Inventory management
    ├── quote/        # Quote request
    ├── services/     # Services catalog
    └── workers/      # Worker map
```

## Future Integrations

- 💳 PayPal SDK for payments
- 🛍️ Mercado Libre API
- 📧 Email notifications
- 📱 SMS notifications
- 🔄 Real-time updates with Socket.io

## Planned AI Enhancements

- 🤖 AI service routing: intelligent assignment of requests to the best technician based on skills, location, and availability.
- 🧠 Deep learning models: supervised and unsupervised training pipelines to improve predictions (eta, pricing, churn risk, demand forecasting).
- 🧭 Agentic automation: autonomous workflow agents to orchestrate inspections, scheduling, inventory checks, and follow-ups.
- 🚀 Production-ready MLOps: continuous retraining, evaluation, and rollout strategies with safeguards and canary releases.
- 📈 Smart marketing automation: audience scoring, personalized offers, and campaign sequencing driven by model insights.
- 🔐 Guardrails & governance: bias monitoring, drift detection, and human-in-the-loop review for critical decisions.

## Architecture & Workflows (visual)

### High-level component map

```mermaid
flowchart LR
    subgraph Frontend [Frontend (Vite + React 19 + TS)]
        UI[UI Components]
        State[Zustand Stores]
        I18n[i18next]
        Maps[Leaflet]
    end

    subgraph Backend [Backend (Node/Express planned)]
        API[REST API]
        Auth[Auth & Tokens]
        Services[Services/Quotes/Workers]
        Inventory[Inventory]
    end

    subgraph Integrations [Integrations]
        PayPal[PayPal SDK]
        Mercado[Mercado Libre]
        Notif[Email/SMS]
    end

    UI -->|Axios| API
    State --> UI
    I18n --> UI
    Maps --> UI
    API --> Services
    API --> Inventory
    API --> Auth
    API --> PayPal
    API --> Mercado
    API --> Notif
```

### Service request workflow (happy path)

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant API as Backend API
    participant Worker as Technician

    User->>FE: Select service & location
    FE->>API: POST /api/quotes (details)
    API-->>API: Validate, price, queue task
    API->>Worker: Assign job & notify
    Worker->>API: Confirm availability
    API-->>FE: Quote accepted + ETA
    FE-->>User: Show confirmation & tracking
```

### AI/agentic automation loop (planned)

```mermaid
flowchart TD
    Data[Telemetry & historical data]
    Train[Supervised/unsupervised training]
    Eval[Eval + drift checks]
    Deploy[Canary/gradual deployment]
    Agent[Agentic Orchestrator]
    Actions[Scheduling, inventory, follow-ups, marketing]

    Data --> Train --> Eval --> Deploy --> Agent --> Actions
    Actions --> Data
```

![Architecture Diagram](public/img/diagrams/architecture.svg)

> Tip: To replace this placeholder image, export your Mermaid diagram as SVG from <https://mermaid.live> and save it to `public/img/diagrams/architecture.svg`.

## 📚 Comprehensive Documentation

For detailed project structure and architecture information, see:

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete directory structure, component hierarchy, data flow diagrams, and detailed documentation of all modules
- **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - Visual system architecture diagrams including component hierarchy, authentication flow, service workflows, and API architecture
- **[STRUCTURE_QUICK_REFERENCE.md](STRUCTURE_QUICK_REFERENCE.md)** - Quick reference guide with directory tree, key components map, technology overview, and API endpoints

These documents provide a comprehensive view of the entire project structure, making it easy to:
- 🔍 Navigate the codebase
- 🏗️ Understand the architecture
- 📊 View component relationships
- 🔄 Follow data flows
- 🛣️ Understand routing and state management
- 🔌 Reference API endpoints

## License

Private - All rights reserved

## Copyright

© 2026 Marcos Mora. All rights reserved.
