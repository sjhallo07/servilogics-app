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
if curl -s http://localhost:5175 > /dev/null; then
    echo "✅ Frontend server running"
else
    echo "❌ Frontend server not responding"
fi

echo ""
echo "📋 Manual Tests:"
echo "1. Open http://localhost:5175/find-workers"
echo "2. Allow geolocation permission"
echo "3. Verify map loads with markers"
echo "4. Test zone filter"
echo "5. Test worker details click"
