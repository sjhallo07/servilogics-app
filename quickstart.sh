#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Missing required command: $1" >&2
        exit 1
    fi
}

check_node_version() {
    local major
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [ "$major" -lt 18 ]; then
        echo "❌ Node.js 18+ is required. Found $(node -v)." >&2
        exit 1
    fi
}

install_if_missing() {
    local dir="$1"
    if [ ! -d "$dir/node_modules" ]; then
        echo "📦 Installing dependencies in $dir ..."
        npm install --prefix "$dir"
    else
        echo "✅ Dependencies already present in $dir (skip install)"
    fi
}

run_lint_if_requested() {
    if [ "${RUN_LINT:-0}" = "1" ]; then
        echo "🔍 Running linters (frontend + backend) ..."
        npm run lint:all
    fi
}

start_backend() {
    echo "🚀 Starting backend dev server (PORT=${PORT:-3001}) ..."
    PORT="${PORT:-3001}" npm run dev --prefix "$BACKEND_DIR" &
    BACKEND_PID=$!
}

start_frontend() {
    echo "🌐 Starting frontend dev server (Vite) ..."
    npm run dev -- --host
}

cleanup() {
    if [ -n "${BACKEND_PID:-}" ] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
        echo "🛑 Stopping backend (pid $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
}

usage() {
    cat <<'EOF'
quickstart.sh - install deps and run both servers locally.

Usage:
  ./quickstart.sh [--lint]

Options:
  --lint   Run ESLint (frontend + backend) after installs, before serving.

Notes:
  - Requires Node.js 18+ and npm.
  - Backend defaults to PORT=3001; override by exporting PORT before running.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

if [[ "${1:-}" == "--lint" ]]; then
    RUN_LINT=1
fi

trap cleanup EXIT

require_cmd node
require_cmd npm
check_node_version

install_if_missing "$ROOT_DIR"
install_if_missing "$BACKEND_DIR"
run_lint_if_requested

BACKEND_PID=""
start_backend
start_frontend
