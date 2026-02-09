#!/bin/bash

# ============================================
# servilogics-app - Development Setup Script
# Version: 1.0.0
# Description: Local PC setup for Copilot integration
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="servilogics-app"
PROJECT_DIR="$(pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=5173
DATABASE_PORT=5432
FORCE_SCRIPTS=false

# ============================================
# Utility Functions
# ============================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# ============================================
# Main Setup Function
# ============================================

setup_development_environment() {
    print_header "🚀 Setting up $PROJECT_NAME Development Environment"
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies
    install_dependencies
    
    # Configure environment
    setup_environment
    
    # Configure Copilot
    setup_copilot
    
    # Create useful scripts
    create_utility_scripts
    
    print_header "🎉 Setup Complete!"
    show_next_steps
}

# ============================================
# Step 1: Check Prerequisites
# ============================================

check_prerequisites() {
    print_header "1. Checking Prerequisites"
    
    local missing_deps=()
    
    # Check Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js $(node --version)"
    else
        missing_deps+=("Node.js (v18+)")
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm --version)"
    else
        missing_deps+=("npm")
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        print_success "Git $(git --version | cut -d' ' -f3)"
    else
        missing_deps+=("Git")
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
    else
        print_warning "Docker not installed (optional for database)"
    fi
    
    # Check VSCode/Copilot
    if command -v code &> /dev/null; then
        print_success "VS Code installed"
    else
        print_warning "VS Code not installed (recommended for Copilot)"
    fi
    
    # Exit if missing required dependencies
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo -e "\nPlease install them and run the script again."
        exit 1
    fi
}

# ============================================
# Step 2: Install Dependencies
# ============================================

install_dependencies() {
    print_header "2. Installing Dependencies"
    
    # Frontend dependencies
    if [ -f "package.json" ]; then
        print_warning "Installing frontend dependencies..."
        npm install
        
        # Install map-related packages
        print_warning "Installing map dependencies..."
        npm install leaflet react-leaflet @types/leaflet
        npm install @react-google-maps/api  # Optional Google Maps
        
        print_success "Frontend dependencies installed"
    fi
    
    # Backend dependencies
    if [ -d "backend" ]; then
        cd "backend"
        print_warning "Installing backend dependencies..."
        npm install
        cd ..
        print_success "Backend dependencies installed"
    fi
    
    # Install development tools
    print_warning "Installing development tools..."
    npm install -D nodemon concurrently cross-env
}

# ============================================
# Step 3: Environment Configuration
# ============================================

setup_environment() {
    print_header "3. Configuring Environment"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# ============================================
# Ecme-lite-cesar - Development Environment
# ============================================

# Application
NODE_ENV=development
APP_PORT=$FRONTEND_PORT
API_PORT=$BACKEND_PORT

# Maps Configuration
MAP_PROVIDER=leaflet
VITE_MAP_PROVIDER=leaflet
VITE_API_URL=http://localhost:$BACKEND_PORT

# Google Maps (optional - get from https://console.cloud.google.com)
# VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Mapbox (optional)
# VITE_MAPBOX_ACCESS_TOKEN=your_token_here

# Features
VITE_ENABLE_WORKERS_MAP=true
VITE_ENABLE_INVENTORY=true
VITE_ENABLE_QUOTES=true

# Defaults
VITE_DEFAULT_CURRENCY=USD
VITE_DEFAULT_LANGUAGE=en

# Copilot
COPILOT_ENABLED=true
EOF
        print_success ".env file created"
    else
        print_warning ".env file already exists"
    fi
    
    # Create backend .env if needed
    if [ -d "backend" ] && [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
PORT=$BACKEND_PORT

# MongoDB configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ecme_lite

# Uploads
UPLOAD_DIR=uploads

# Agent configuration
AGENT_TIMEOUT_MS=60000
AGENT_MAX_REQ_BODY=262144
AGENT_MAX_NONSTREAM_RESP=2097152
AGENT_SSE_HEARTBEAT_MS=15000

# Allowed hosts
AGENT_HOST_ALLOWLIST=localhost,127.0.0.1,api.openai.com,*.openai.azure.com
EOF
        print_success "Backend .env configured"
    fi
}

# ============================================
# Step 4: Copilot Configuration
# ============================================

setup_copilot() {
    print_header "4. Configuring GitHub Copilot"
    
    # Configure Copilot for this project
    cat > .copilot-config.json << EOF
{
  "project": "$PROJECT_NAME",
  "context": {
    "framework": "React + Node.js + Express",
    "features": [
      "Real-time worker tracking",
      "Interactive maps with Leaflet/Google Maps",
      "Role-based dashboards (Admin, Staff, Client)",
      "Geolocation services",
      "Worker management",
      "Photo uploads",
      "Inventory management"
    ],
    "filePatterns": {
      "components": "src/components/**/*.{tsx,jsx}",
      "pages": "src/views/**/*.{tsx,jsx}",
      "api": "backend/src/routes/**/*.{js,ts}",
      "maps": "**/*map*.{tsx,jsx}",
      "services": "src/services/**/*.{ts,tsx}"
    }
  },
  "preferences": {
    "codeStyle": "typescript",
    "testing": "jest",
    "documentation": "jsdoc"
  }
}
EOF
    print_success "Copilot project configuration created"
    
    # Create Copilot prompts file
    create_copilot_prompts
}

create_copilot_prompts() {
    cat > .copilot-prompts.md << 'EOF'
# 🗺️ Ecme-lite-cesar - Copilot Prompts

## Project Context
This is a worker tracking system with interactive maps for Admin, Staff, and Client dashboards.

## Common Tasks & Prompts

### 1. Map Components
```typescript
// Create a React component for worker markers on Leaflet map
// Include popups with worker details and status colors
// Use TypeScript with Worker interface from @/@types/services
```

```typescript
// Create a location update hook for real-time tracking
// Implement geolocation watcher with error handling
// Handle permission requests gracefully
```

```typescript
// Build a zone filter component for the map
// Include search by specialty and availability
// Use React hooks for state management
```

### 2. API Endpoints
```javascript
// Create Express route for updating worker location
// Include validation and error handling
// Check role-based permissions for staff/admin only
```

```javascript
// Build middleware for role-based access control
// Admin: full access, Staff: own data only, Client: read-only
// Extract role and userId from query parameters
```

### 3. Database Queries
```javascript
// Write function for finding workers within radius
// Include availability and specialty filtering
// Sort by distance and rating
```

```javascript
// Create worker status color mapper
// Available: green, Busy: yellow, Offline: gray
// Use Tailwind CSS class names
```

### 4. Utility Functions
```typescript
// Create function to calculate distance between coordinates
// Implement Haversine formula
// Return distance in kilometers
```

```typescript
// Build location data validation utility
// Check lat/lng boundaries
// Validate timestamp format
```

## Code Patterns to Follow

### React Components
- Use TypeScript interfaces for props
- Implement responsive design with Tailwind
- Use React hooks for state management
- Follow atomic design principles
- Import types from @/@types/

### API Design
- RESTful endpoints with consistent naming
- Role-based authorization on every endpoint
- Comprehensive error responses
- Request/response validation
- Use query parameters for role/userId

### Maps Integration
- Support multiple providers (Leaflet, Google, Mapbox)
- Implement marker clustering for performance
- Add custom map controls
- Handle geolocation permissions gracefully

## Testing Prompts
```typescript
// Write Jest test for WorkersMapEnhanced component
// Mock geolocation API and Leaflet library
// Test role-based visibility
```

```javascript
// Create integration test for location update endpoint
// Simulate different user roles (admin, staff, client)
// Test permission validation
```
EOF
    
    print_success "Copilot prompts file created at .copilot-prompts.md"
}

# ============================================
# Step 5: Create Utility Scripts
# ============================================

create_utility_scripts() {
    print_header "5. Creating Utility Scripts"

    if [ "$FORCE_SCRIPTS" = false ] && { [ -f "start-dev.sh" ] || [ -f "stop-dev.sh" ] || [ -f "test-maps.sh" ] || [ -f "copilot-helper.sh" ]; }; then
        print_warning "Utility scripts already exist. Skipping overwrite (use --force-scripts to regenerate)."
        return
    fi
    
    # Startup script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Ecme-lite-cesar development environment..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Kill processes on ports if they exist
cleanup_ports() {
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
}

cleanup_ports

# Start backend
if [ -d "backend" ]; then
    echo "Starting backend server on port 3001..."
    cd backend && npm start > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✓${NC} Backend PID: $BACKEND_PID"
fi

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend on port 5173..."
npm run dev -- --port 5173 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend PID: $FRONTEND_PID"

# Wait for services
sleep 3

# Show status
echo ""
echo "📊 Development Dashboards:"
echo -e "   ${GREEN}✓${NC} Admin:    http://localhost:5173/admin/workers-map"
echo -e "   ${GREEN}✓${NC} Staff:    http://localhost:5173/staff/workers"
echo -e "   ${GREEN}✓${NC} Client:   http://localhost:5173/find-workers"
echo -e "   ${GREEN}✓${NC} Backend:  http://localhost:3001/api"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Press Ctrl+C to stop services"

# Trap CTRL+C
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
EOF
    chmod +x start-dev.sh
    
    # Stop script
    cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping services..."

lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
EOF
    chmod +x stop-dev.sh
    
    # Test maps script
    cat > test-maps.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Map Integration..."

# Test API
echo "1. Testing Workers API..."
if curl -s http://localhost:3001/api/workers | grep -q "success"; then
    echo "✅ Workers API working"
else
    echo "❌ Workers API failed"
fi

# Test Zones
echo "2. Testing Zones API..."
if curl -s http://localhost:3001/api/workers/zones/list | grep -q "North Zone"; then
    echo "✅ Zones API working"
else
    echo "❌ Zones API failed"
fi

# Test Frontend
echo "3. Checking Frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend server running"
else
    echo "❌ Frontend server not responding"
fi

echo ""
echo "📋 Manual Tests:"
echo "1. Open http://localhost:5173/find-workers"
echo "2. Allow geolocation permission"
echo "3. Verify map loads with markers"
echo "4. Test zone filter"
echo "5. Test worker details click"
EOF
    chmod +x test-maps.sh
    
    # Copilot helper
    cat > copilot-helper.sh << 'EOF'
#!/bin/bash
# Copilot helper for common tasks

case "$1" in
    "prompts")
        echo "📋 Available Copilot Prompts:"
        grep -A 2 "^## Common" .copilot-prompts.md
        ;;
    "setup")
        echo "🔧 Setup Instructions:"
        echo "1. Install GitHub Copilot extension in VS Code"
        echo "2. Authenticate: Cmd+Shift+P > Copilot: Sign In"
        echo "3. In code: Cmd+I for inline suggestions"
        echo "4. Chat: Cmd+Shift+I for Copilot Chat"
        ;;
    "components")
        echo "🎨 Generate Map Component:"
        echo "Prompt: Create a React component for worker markers on Leaflet map"
        ;;
    "api")
        echo "🔌 Generate API Route:"
        echo "Prompt: Create Express route for updating worker location with validation"
        ;;
    *)
        echo "Copilot Helper - Available Commands:"
        echo "  prompts     - Show available prompts"
        echo "  setup       - Setup instructions"
        echo "  components  - Map component prompt"
        echo "  api         - API route prompt"
        ;;
esac
EOF
    chmod +x copilot-helper.sh
    
    print_success "Utility scripts created"
    echo "  • start-dev.sh     - Start development servers"
    echo "  • stop-dev.sh      - Stop all services"
    echo "  • test-maps.sh     - Test map functionality"
    echo "  • copilot-helper.sh - Copilot assistance"
}

# ============================================
# Final Steps
# ============================================

show_next_steps() {
    cat << 'EOF'

✅ Development Environment Ready!

📋 Next Steps:

1. 🚀 Start Development Servers:
   ./start-dev.sh

2. 📱 Access the Application:
    • Admin:    http://localhost:5173/admin/workers-map
    • Staff:    http://localhost:5173/staff/workers
    • Client:   http://localhost:5173/find-workers
   • API:      http://localhost:3001/api/workers

3. 🧪 Test Everything:
   ./test-maps.sh

4. 🤖 Use GitHub Copilot:
   • Press Cmd+I in VS Code for inline suggestions
   • Check .copilot-prompts.md for common prompts
   • Run: ./copilot-helper.sh setup

5. 📝 Development Workflow:
   • Edit files in src/views/workers/
   • Changes auto-reload in browser
   • Check console for errors
   • Use Copilot for code generation

6. 🛑 Stop Services:
   ./stop-dev.sh

📚 Useful Resources:
    • Maps Guide:        MAPS_DASHBOARD_GUIDE.md
   • Copilot Prompts:   .copilot-prompts.md
   • API Reference:     MAP_DATA_IMPLEMENTATION.md
   • Integration:       INTEGRATION_GUIDE.md

🔧 Troubleshooting:
   • Port conflict?          Update .env
   • Maps not loading?       Check browser console
   • API not responding?     Check backend logs
   • Permission denied?      Allow geolocation in browser

🎯 Happy Coding! 🚀

EOF
}

# ============================================
# Script Execution
# ============================================

case "$1" in
    "--help" | "-h")
        cat << EOF
Usage: ./setup-dev-env.sh [OPTION]

Options:
  --quick    Skip Copilot setup (faster)
    --force-scripts  Overwrite start/stop/test scripts
  --help, -h Show this help message
  (default)  Full setup with Copilot

Examples:
  ./setup-dev-env.sh        # Full setup
  ./setup-dev-env.sh --quick # Skip Copilot
EOF
        exit 0
        ;;
    "--quick")
        print_header "Quick Setup Mode"
        check_prerequisites
        install_dependencies
        setup_environment
        create_utility_scripts
        show_next_steps
        ;;
    "--force-scripts")
        FORCE_SCRIPTS=true
        setup_development_environment
        ;;
    *)
        setup_development_environment
        ;;
esac
