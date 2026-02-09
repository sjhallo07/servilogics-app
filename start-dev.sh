#!/bin/bash
echo "🚀 servilogics-app development environment..."

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Missing required: $1" >&2
        exit 1
    fi
}

require_cmd lsof
require_cmd npm

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
LOG_DIR=".logs"
mkdir -p "$LOG_DIR"

if [ -d "backend" ]; then
    echo "Starting backend server on port 3001..."
    cd backend && npm start > "../$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✓${NC} Backend PID: $BACKEND_PID"
fi

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend on port 5173..."
npm run dev -- --port 5173 > "$LOG_DIR/frontend.log" 2>&1 &
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
echo "   Backend: tail -f $LOG_DIR/backend.log"
echo "   Frontend: tail -f $LOG_DIR/frontend.log"
echo ""
echo "Press Ctrl+C to stop services"

# Trap CTRL+C
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
