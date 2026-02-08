#!/bin/bash
echo "🧪 Testing Map Integration..."

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Missing required: $1" >&2
        exit 1
    fi
}

require_cmd curl
require_cmd grep

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
