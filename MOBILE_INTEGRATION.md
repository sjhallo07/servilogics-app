# Mobile Integration (Android/iOS)

This guide describes how mobile clients (Android or iOS) can integrate with the backend to publish worker presence and operational status.

## Base URL

- Development: `http://localhost:3001/api`
- Production: set your public backend URL accordingly.

All requests should include query params to indicate role/user:

- `role`: `admin` or `staff` (required for mutating operations)
- `userId`: worker's ID when role is `staff` (to restrict updates to own profile)

Example: `POST /api/workers/wrk-001/location?role=staff&userId=wrk-001`

## Endpoints

### 1) Update Location

```http
POST /api/workers/:id/location?role=staff&userId=:id
Content-Type: application/json

{
  "lat": 37.7749,
  "lng": -122.4194
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "wrk-001",
    "currentLocation": {
      "lat": 37.7749,
      "lng": -122.4194,
      "timestamp": 1737855600000
    }
  },
  "message": "Location updated successfully"
}
```

### 2) Update Availability

```http
POST /api/workers/:id/availability?role=staff&userId=:id
Content-Type: application/json

{
  "availability": "available" // one of: available | busy | offline
}
```

Response:

```json
{
  "success": true,
  "data": { "id": "wrk-001", "availability": "available" },
  "message": "Availability updated successfully"
}
```

### 3) Heartbeat (Presence)

```http
POST /api/workers/:id/heartbeat?role=staff&userId=:id
```

Response:

```json
{
  "success": true,
  "data": { "id": "wrk-001", "lastSeen": 1737855600000 },
  "message": "Heartbeat recorded"
}
```

Use this to periodically confirm app connectivity (e.g., every 5 minutes).

## Sample cURL

```bash
# Update location
curl -X POST "http://localhost:3001/api/workers/wrk-001/location?role=staff&userId=wrk-001" \
  -H "Content-Type: application/json" \
  -d '{"lat":40.7128,"lng":-74.0060}'

# Update availability
curl -X POST "http://localhost:3001/api/workers/wrk-001/availability?role=staff&userId=wrk-001" \
  -H "Content-Type: application/json" \
  -d '{"availability":"busy"}'

# Heartbeat
curl -X POST "http://localhost:3001/api/workers/wrk-001/heartbeat?role=staff&userId=wrk-001"
```

## Android/iOS Client Notes

- Android (Kotlin/Java) and iOS (Swift) can call these endpoints using standard HTTP clients (OkHttp/Retrofit for Android, URLSession/Alamofire for iOS).
- Persist `role` and `userId` after authentication. For production, secure with proper auth (JWT/API keys) and HTTPS.
- If the backend is unreachable, the frontend (web) now gracefully falls back to mock data; mobile clients should also cache critical worker info and retry on connectivity restoration.

## Frontend Hooks

- Web frontend displays banners when backend is offline and shows mock data.
- The Workers page shows `lastSeen` in the worker modal, so admins can verify connectivity.
