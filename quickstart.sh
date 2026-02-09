#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${PORT:-3001}"
LOG_DIR="$ROOT_DIR/.logs"
NO_INSTALL=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

usage() {
    cat <<EOF
Usage: ./quickstart.sh [options]

Options:
  -h, --help          Show this help
  -n, --no-install    Skip npm install steps
  -b, --backend-only  Start only the backend
  -f, --frontend-only Start only the frontend

Environment:
  PORT              Backend port (default: 3001)
  FRONTEND_PORT     Frontend port (default: 5173)
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help) usage; exit 0 ;;
        -n|--no-install) NO_INSTALL=true ;;
        -b|--backend-only) BACKEND_ONLY=true ;;
        -f|--frontend-only) FRONTEND_ONLY=true ;;
        *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
    esac
    shift
done

echo "========================================="
echo "🗺️  servilogics-app Quickstart"
echo "========================================="
echo ""

# Checks
require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Missing required: $1" >&2
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
require_cmd bash
require_cmd lsof
require_cmd curl
require_cmd grep
check_node_version
echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

# Env helpers
ensure_env() {
    local target="$1" example="$2"
    if [ -f "$target" ]; then
        echo "✅ Found $(basename "$target")"
    elif [ -f "$example" ]; then
        cp "$example" "$target"
        echo "✅ Created $(basename "$target") from $(basename "$example")"
    else
        echo "⚠️  Missing $target and no example found"
    fi
}

echo "⚙️  Checking environment files..."
ensure_env "$ROOT_DIR/.env" "$ROOT_DIR/.env.example"
ensure_env "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.example"
echo ""

# Install deps
install_deps() {
    local dir="$1" name="$2"
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Installing $name dependencies..."
        npm install --prefix "$dir" --silent
        echo "✅ $name dependencies installed"
    else
        echo "✅ $name dependencies already installed"
    fi
}

if [ "$NO_INSTALL" = false ]; then
    echo "📦 Installing dependencies..."
    install_deps "$ROOT_DIR" "Frontend"
    install_deps "$BACKEND_DIR" "Backend"
    echo ""
else
    echo "⏭️  Skipping npm install"
fi

# Cleanup handler
cleanup() {
    if [ -n "${BACKEND_PID:-}" ] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
        echo ""
        echo "🛑 Stopping backend (PID: $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "========================================="
echo "🚀 Starting Development Servers"
echo "========================================="
echo ""

mkdir -p "$LOG_DIR"

if [ "$FRONTEND_ONLY" = false ]; then
    echo "🔧 Backend API starting on port $BACKEND_PORT..."
    PORT="$BACKEND_PORT" npm start --prefix "$BACKEND_DIR" > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    sleep 2
    if ps -p "$BACKEND_PID" >/dev/null 2>&1; then
        echo "✅ Backend running (PID: $BACKEND_PID)"
    else
        echo "❌ Backend failed to start. Check $LOG_DIR/backend.log"
        exit 1
    fi
fi

if [ "$BACKEND_ONLY" = true ]; then
    echo ""
    echo "Backend ready at http://localhost:$BACKEND_PORT/api/health"
    echo "Press Ctrl+C to stop."
    while true; do sleep 3600; done
fi

echo "🌐 Frontend starting on port $FRONTEND_PORT..."
echo ""
echo "💡 Tip: Allow location access when prompted"
echo ""
echo "📱 Mobile apps (run in separate terminals):"
echo "  Classic Expo app:   cd mobile-app && npx expo start"
echo "  Expo Router app:    cd servilogics-app && npx expo start"
echo ""
echo "🛑 Press Ctrl+C to stop all services"
echo ""

npm run dev -- --host --port "$FRONTEND_PORT"
