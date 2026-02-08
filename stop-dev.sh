#!/bin/bash
echo "🛑 Stopping services..."

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "❌ Missing required: $1" >&2
		exit 1
	fi
}

require_cmd lsof

lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
