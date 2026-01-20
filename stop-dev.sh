#!/bin/bash
echo "🛑 Stopping services..."

lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5175 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
