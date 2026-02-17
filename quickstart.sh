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
DOCKER_MODE=false
DO_ASSIGN_IP=false
FAST_MODE=false

usage() {
    cat <<EOF
Usage: ./quickstart.sh [options]

Options:
  -h, --help          Show this help
  -n, --no-install    Skip npm install steps
  -b, --backend-only  Start only the backend
    -d, --docker        Run services inside Docker containers
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
        -d|--docker) DOCKER_MODE=true ;;
            -a|--assign-ip) DO_ASSIGN_IP=true ;;
        --ignore-prereqs) IGNORE_PREREQS=true ;;
        -s|--fast) FAST_MODE=true ;;
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
        echo "⚠️  Missing required: $1" >&2
        if [ "${IGNORE_PREREQS:-false}" = "true" ]; then
            echo "Continuing despite missing $1 because IGNORE_PREREQS=true"
            return 0
        fi
        exit 1
    fi
}

check_node_version() {
    if ! command -v node >/dev/null 2>&1; then
        echo "⚠️  Node not found; skipping node version check"
        return 0
    fi
    local major
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [ "$major" -lt 18 ]; then
        echo "❌ Node.js 18+ required. Found: $(node -v)" >&2
        exit 1
    fi
}

if [ "$FAST_MODE" = true ]; then
    echo "⚡ Fast mode enabled — skipping prerequisite checks and slow validations"
    IGNORE_PREREQS=true
else
    echo "📋 Checking prerequisites..."
    require_cmd node
    require_cmd npm
    require_cmd bash
    require_cmd lsof
    require_cmd curl
    require_cmd grep
    check_node_version
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js $(node -v)"
    else
        echo "⚠️  Node.js not available"
    fi
    if command -v npm >/dev/null 2>&1; then
        echo "✅ npm $(npm -v)"
    else
        echo "⚠️  npm not available"
    fi
    echo ""
fi

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

# Validate VITE_API_URL vs local IPs and warn if misconfigured
validate_vite_api_url() {
    local env_file="$ROOT_DIR/.env"
    local vite_url="${VITE_API_URL:-}"
    if [ -f "$env_file" ] && [ -z "$vite_url" ]; then
        vite_url=$(grep -E '^VITE_API_URL=' "$env_file" || true)
        vite_url=${vite_url#VITE_API_URL=}
        vite_url=${vite_url//\"/}
        vite_url=${vite_url//\'/}
    fi
    if [ -z "$vite_url" ]; then
        return 0
    fi

    # extract host (strip protocol and optional path/port)
    local host
    host=$(echo "$vite_url" | sed -E 's#^[^/]*//##' | cut -d/ -f1 | cut -d: -f1)
    if [ -z "$host" ]; then
        return 0
    fi

    # only attempt auto-assign for IPv4 addresses
    if ! echo "$host" | grep -E -q '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
        # host is not an IPv4 address (could be hostname); skip auto-assign
        return 0
    fi

    # gather local IPv4 addresses
    local addrs
    if command -v ip >/dev/null 2>&1; then
        addrs=$(ip -4 addr show scope global | awk '/inet/ {print $2}' | cut -d/ -f1 | tr '\n' ' ')
    elif command -v hostname >/dev/null 2>&1; then
        addrs=$(hostname -I 2>/dev/null || true)
    else
        addrs=""
    fi

    if echo " $addrs " | grep -qw "$host"; then
        echo "✅ VITE_API_URL host ($host) matches a local IP"
    else
        echo "⚠️  VITE_API_URL host ($host) does not match any local IP addresses: $addrs"
        echo "   If you need LAN access, update .env VITE_API_URL to your host IP (e.g. http://192.168.100.82:3001)"
        echo "   You can optionally run: scripts/assign_local_ip.sh to add a temporary IP (requires sudo)"
        if [ "$DO_ASSIGN_IP" = true ]; then
            # determine interface (first non-loopback)
            if command -v ip >/dev/null 2>&1; then
                IFACE=$(ip -4 addr show scope global | awk '/inet/ {print $NF; exit}')
            else
                IFACE=eth0
            fi
            IP_CIDR="$host/24"
            echo "🔧 Running scripts/assign_local_ip.sh $IP_CIDR $IFACE"
            bash "$ROOT_DIR/scripts/assign_local_ip.sh" ${IP_CIDR} ${IFACE} -y || true
        else
            # interactive offer
            read -p "¿Deseas añadir esta IP temporalmente a la interfaz local ahora? [y/N]: " resp
            resp=${resp:-N}
            if [[ "$resp" =~ ^[Yy]$ ]]; then
                if command -v ip >/dev/null 2>&1; then
                    IFACE=$(ip -4 addr show scope global | awk '/inet/ {print $NF; exit}')
                else
                    IFACE=eth0
                fi
                IP_CIDR="$host/24"
                bash "$ROOT_DIR/scripts/assign_local_ip.sh" ${IP_CIDR} ${IFACE}
            fi
        fi
    fi
}

if [ "$FAST_MODE" = true ]; then
    echo "⚡ Fast mode: skipping VITE_API_URL validation"
else
    validate_vite_api_url
fi

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
    if [ "$DOCKER_MODE" = true ]; then
        echo "🛑 Stopping Docker containers..."
        docker rm -f servilogics-backend >/dev/null 2>&1 || true
        docker rm -f servilogics-frontend >/dev/null 2>&1 || true
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
    if [ "$DOCKER_MODE" = true ]; then
        if ! command -v docker >/dev/null 2>&1; then
            echo "❌ Docker is required for --docker mode but was not found." >&2
            exit 1
        fi
        echo "📦 Starting backend in Docker (servilogics-backend)..."
        docker rm -f servilogics-backend >/dev/null 2>&1 || true
        docker run -d --name servilogics-backend -p ${BACKEND_PORT}:3001 \
          -e PORT=3001 -e MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017}" \
          -v "$BACKEND_DIR":/app -w /app node:18 bash -lc "npm ci --no-audit --no-fund && npm start"
        sleep 2
        if docker ps --filter "name=servilogics-backend" --format '{{.Names}}' | grep -q servilogics-backend; then
            echo "✅ Backend Docker container started"
        else
            echo "❌ Backend Docker container failed to start"
            exit 1
        fi
    else
        if command -v npm >/dev/null 2>&1; then
            PORT="$BACKEND_PORT" npm start --prefix "$BACKEND_DIR" > "$LOG_DIR/backend.log" 2>&1 &
            BACKEND_PID=$!
            sleep 2
            if ps -p "$BACKEND_PID" >/dev/null 2>&1; then
                echo "✅ Backend running (PID: $BACKEND_PID)"
            else
                echo "❌ Backend failed to start. Check $LOG_DIR/backend.log"
                exit 1
            fi
        else
            echo "⚠️  npm not available — skipping backend start (use --ignore-prereqs to force)"
        fi
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

if [ "$DOCKER_MODE" = true ]; then
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker is required for --docker mode but was not found." >&2
        exit 1
    fi
    echo "📦 Starting frontend in Docker (servilogics-frontend)..."
    docker rm -f servilogics-frontend >/dev/null 2>&1 || true
    docker run -d --name servilogics-frontend -p ${FRONTEND_PORT}:5173 \
      -v "$ROOT_DIR":/app -w /app node:18 bash -lc "npm ci --no-audit --no-fund && npm run dev -- --host --port ${FRONTEND_PORT}"
    sleep 2
    if docker ps --filter "name=servilogics-frontend" --format '{{.Names}}' | grep -q servilogics-frontend; then
        echo "✅ Frontend Docker container started"
    else
        echo "❌ Frontend Docker container failed to start"
        exit 1
    fi
else
    if command -v npm >/dev/null 2>&1; then
        npm run dev -- --host --port "$FRONTEND_PORT"
    else
        echo "⚠️  npm not available — skipping frontend start"
    fi
fi
 
