#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "========================================="
echo "🗺️  Ecme-lite Local Setup with Maps"
echo "========================================="
echo ""

# Check prerequisites
require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Missing required: $1" >&2
        echo "   Please install $1 and try again." >&2
        exit 1
    fi
}

check_node_version() {
    local major
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [ "$major" -lt 18 ]; then
        echo "❌ Node.js 18+ required. Found: $(node -v)" >&2
        exit 1
    fi
}

echo "📋 Checking prerequisites..."
require_cmd node
require_cmd npm
check_node_version
echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# Install dependencies
install_deps() {
    local dir="$1"
    local name="$2"
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Installing $name dependencies..."
        npm install --prefix "$dir" --silent
        echo "✅ $name dependencies installed"
    else
        echo "✅ $name dependencies already installed"
    fi
}

echo "📦 Installing dependencies..."
install_deps "$ROOT_DIR" "Frontend"
install_deps "$BACKEND_DIR" "Backend"
echo ""

# Check environment
echo "⚙️  Checking environment..."
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "⚠️  No .env file found. Creating from defaults..."
    cat > "$ROOT_DIR/.env" <<EOF
NODE_ENV=development
APP_PORT=5175
API_PORT=3001

MAP_PROVIDER=leaflet
VITE_MAP_PROVIDER=leaflet
VITE_API_URL=http://localhost:3001

VITE_ENABLE_WORKERS_MAP=true
VITE_ENABLE_INVENTORY=true

VITE_DEFAULT_CURRENCY=USD
VITE_DEFAULT_LANGUAGE=en
EOF
    echo "✅ .env file created with map defaults"
else
    echo "✅ .env file exists"
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "⚠️  No backend .env found. Creating..."
    cat > "$BACKEND_DIR/.env" <<EOF
PORT=3001
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ecme_lite
UPLOAD_DIR=uploads
AGENT_TIMEOUT_MS=60000
AGENT_HOST_ALLOWLIST=localhost,127.0.0.1
JWT_SECRET=dev_secret_key
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env exists"
fi
echo ""

# Start servers
cleanup() {
    if [ -n "${BACKEND_PID:-}" ] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
        echo ""
        echo "🛑 Stopping servers..."
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

echo "========================================="
echo "🚀 Starting Development Servers"
echo "========================================="
echo ""

echo "🔧 Backend API starting on port 3001..."
PORT=3001 npm start --prefix "$BACKEND_DIR" > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

if ps -p "$BACKEND_PID" >/dev/null 2>&1; then
    echo "✅ Backend running (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start. Check /tmp/backend.log"
    exit 1
fi

echo "🌐 Frontend starting on port 5175..."
echo ""
echo "========================================="
echo "📍 Map Dashboards Ready:"
echo "========================================="
echo "   Admin with Geolocation:  http://localhost:5175/admin"
echo "   Staff Workers:           http://localhost:5175/staff/workers"
echo "   Client Worker Map:       http://localhost:5175/find-workers"
echo "   Backend API:             http://localhost:3001/api/workers"
echo ""
echo "🔑 Features:"
echo "   ✓ Leaflet maps with OpenStreetMap"
echo "   ✓ Real-time GPS geolocation"
echo "   ✓ Admin location tracking"
echo "   ✓ Worker availability markers"
echo "   ✓ Zone filtering"
echo ""
echo "💡 Tip: Allow location access when prompted"
echo "🛑 Press Ctrl+C to stop all servers"
echo "========================================="
echo ""

npm run dev -- --host
