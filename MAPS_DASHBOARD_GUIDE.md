# 🗺️ Worker Maps Dashboard - Complete Guide

## Overview

This guide provides comprehensive documentation for the worker mapping system across Admin, Client, and Staff dashboards. It includes setup instructions, SDK integration, device permissions, and mobile app guidance.

---

## 📋 Table of Contents

1. [Feature Overview](#feature-overview)
2. [Dashboard Access by Role](#dashboard-access-by-role)
3. [Finding Workers](#finding-workers)
4. [Map Integration Setup](#map-integration-setup)
5. [Device Permissions](#device-permissions)
6. [Mobile Integration](#mobile-integration)
7. [API Reference](#api-reference)
8. [Examples & Use Cases](#examples--use-cases)

---

## 🎯 Feature Overview

### What is the Maps Dashboard?

The Maps Dashboard is an interactive geolocation system that:

- ✅ Displays real-time worker locations on an interactive map
- ✅ Enables searching and filtering workers by zone/specialty
- ✅ Provides role-based access (Admin, Staff, Client)
- ✅ Supports real-time GPS tracking
- ✅ Integrates with geolocation services
- ✅ Works on web, Android, and iOS platforms

### Key Components

```
Maps Dashboard
├── Interactive Leaflet Map
├── Worker Location Markers
├── Zone Filtering System
├── Worker Detail Cards
├── Search & Filter
└── Real-time Updates
```

---

## 👥 Dashboard Access by Role

### Admin Dashboard

**Access:** `/admin/workers-map`

**Capabilities:**

- ✅ View all workers (4 staff + offline)
- ✅ See full worker details (contact, certification, experience)
- ✅ Upload worker photos
- ✅ Update worker availability status
- ✅ Edit worker location (manual override)
- ✅ Manage all zones
- ✅ Create/edit/delete workers
- ✅ Access admin management panel

**Map Features:**

- Color-coded markers (green=available, yellow=busy, gray=offline)
- Full contact information visible
- Click markers to manage worker details
- Drag-to-update locations
- Zone filter dropdown
- Real-time availability toggle

**Example Admin Use Case:**

```
1. Login as admin (role: 'admin')
2. Navigate to Workers Map
3. Click on a worker marker
4. Click "Upload Photo" button
5. Select photo from device
6. Photo updates instantly
7. Toggle availability status
8. View full worker profile
```

---

### Staff Dashboard

**Access:** `/staff/workers`

**Capabilities:**

- ✅ View all available workers
- ✅ Update own location (GPS)
- ✅ Update own availability status
- ✅ View specialties and zone assignment
- ✅ See contact information
- ✅ Cannot upload photos
- ✅ Cannot edit other workers

**Map Features:**

- View other staff and available workers
- Real-time location update button
- "You are here" marker for your current location
- Zone filter for searching colleagues
- Quick availability toggle

**Example Staff Use Case:**

```
1. Login as staff (role: 'staff', userId: 'wrk-001')
2. Navigate to Workers Map
3. Click "Share My Location" button
4. Allow geolocation permission
5. Your location updates on map
6. Click "You" marker to see details
7. Update availability (Available/Busy/Offline)
8. View other available workers in zone
```

---

### Client Dashboard

**Access:** `/find-workers`

**Capabilities:**

- ✅ View available workers only (not offline)
- ✅ Search by zone/specialty
- ✅ Call worker (direct phone call)
- ✅ Email worker
- ✅ View worker ratings and reviews
- ✅ See real-time location
- ✅ Filter by specialties
- ✅ Cannot manage workers

**Map Features:**

- Color-coded available workers only
- Basic worker info card (name, rating, zone)
- Call/Email buttons on cards
- Zone filtering
- Specialty filtering
- Map centering on user's location

**Example Client Use Case:**

```
1. Login as client (role: 'client')
2. Navigate to Find Workers
3. Browser requests location permission
4. Allow geolocation to see nearby workers
5. Map centers on your location
6. Click on a worker marker
7. View worker details (rating, specialties)
8. Click "Call" to dial worker
9. Click "Email" to send message
10. See estimated distance
```

---

## 🔍 Finding Workers

### Search Methods

#### 1. Zone Filtering

**How It Works:**

```typescript
// Zone filter dropdown
Available Zones:
- All Zones (default)
- North Zone
- East Zone
- South Zone
- West Zone
```

**To Filter:**

1. Click "Filter by Zone" dropdown
2. Select desired zone
3. Map updates to show only workers in that zone
4. List on right updates dynamically

#### 2. Specialty Filtering

**Available Specialties:**

- Electrical Fencing
- Surveillance Cameras
- Painting
- Air Conditioning
- Preventive Maintenance
- Home Emergency
- Industrial Services
- Commercial Services

**To Search by Specialty:**

1. Look at worker cards
2. Specialties shown as tags
3. Click specialty tag to filter
4. Only workers with that specialty appear

#### 3. Availability Filter

**Status Types:**

- 🟢 **Available** - Worker is online and accepting jobs
- 🟡 **Busy** - Worker is on a job
- ⚫ **Offline** - Worker is not available

**To Filter by Availability:**

- Client: Only sees Available/Busy workers
- Staff: Sees all statuses
- Admin: Sees all statuses

#### 4. Location-Based Search

**Geolocation Features:**

```
Automatic:
- Browser requests permission
- If allowed: Map centers on user
- Shows "You" marker
- Calculates distances to workers

Manual:
- Drag map to area
- Workers in view shown in list
- Scroll list on right sidebar
```

---

## 🗺️ Map Integration Setup

### Leaflet Maps (Current Implementation)

**Current Setup:**

```typescript
// Already configured in WorkersMapEnhanced.tsx
import L from 'leaflet'

const map = L.map('map').setView([40.7128, -74.006], 11)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
```

**Features:**

- ✅ Free and open-source
- ✅ Lightweight
- ✅ Works on all devices
- ✅ No API key required for OpenStreetMap tiles

---

### Google Maps Integration

**To Use Google Maps Instead of Leaflet:**

**Step 1: Get API Key**

```bash
1. Go to Google Cloud Console
2. Create new project: "Ecme-Lite"
3. Enable Maps JavaScript API
4. Enable Geolocation API
5. Create API Key
6. Copy key
```

**Step 2: Add to .env**

```env
# Frontend .env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
VITE_MAP_PROVIDER=google  # or 'leaflet'
```

**Step 3: Update Component**

```typescript
// src/views/workers/WorkersMapGoogle.tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

export default function WorkersMapGoogle() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        center={{ lat: 40.7128, lng: -74.006 }}
        zoom={11}
      >
        {workers.map(worker => (
          <Marker
            key={worker.id}
            position={{
              lat: worker.currentLocation.lat,
              lng: worker.currentLocation.lng
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
```

**Step 4: Install Package**

```bash
npm install @react-google-maps/api
```

**Cost:** Starts free, then ~$7 per 1000 requests

---

### Mapbox Integration

**To Use Mapbox:**

**Step 1: Get Access Token**

```bash
1. Create account at mapbox.com
2. Go to Account → Tokens
3. Create new token
4. Copy token
```

**Step 2: Add to .env**

```env
VITE_MAPBOX_ACCESS_TOKEN=YOUR_TOKEN_HERE
VITE_MAP_PROVIDER=mapbox
```

**Step 3: Install Package**

```bash
npm install react-map-gl mapbox-gl
```

**Step 4: Update Component**

```typescript
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function WorkersMapMapbox() {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  
  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{
        longitude: -74.006,
        latitude: 40.7128,
        zoom: 11
      }}
    >
      {workers.map(worker => (
        <Marker
          key={worker.id}
          longitude={worker.currentLocation.lng}
          latitude={worker.currentLocation.lat}
        />
      ))}
    </Map>
  )
}
```

**Cost:** Starts free, scalable pricing

---

### Azure Maps Integration

**For Azure Cloud Customers:**

**Step 1: Create Azure Maps Account**

```bash
1. Azure Portal → Create Resource
2. Search "Azure Maps"
3. Create new account
4. Copy primary key
```

**Step 2: Add to .env**

```env
VITE_AZURE_MAPS_KEY=YOUR_KEY_HERE
VITE_MAP_PROVIDER=azure
```

**Step 3: Install SDK**

```bash
npm install azure-maps-control
```

**Step 4: Use in Component**

```typescript
import * as atlas from 'azure-maps-control'

const map = new atlas.Map('map', {
  authOptions: {
    authType: 'subscriptionKey',
    subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY
  }
})
```

---

## 📱 Device Permissions

### Geolocation Permission

**What It Is:**

- Request access to device's GPS coordinates
- Required to show user's location on map
- Must be explicitly granted by user

**Implementation:**

```typescript
// Current code in WorkersMapEnhanced.tsx
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })
    },
    (error) => {
      console.warn('Geolocation denied', error)
      setLocationError('Location access denied')
    },
    { enableHighAccuracy: true, timeout: 7000 }
  )
}
```

**Browser Prompt:**

```
"This site wants to know your location"
[Allow] [Don't Allow]
```

**How to Grant:**

1. Click "Allow" when prompted
2. Or: Settings → Site Permissions → Location → Allow

**If Denied:**

- Map still works with default center
- Worker locations still visible
- User's location not shown
- Message: "Unable to access your location"

---

### Camera Permission (For Photo Uploads)

**What It Is:**

- Access to device camera or photo library
- Required for worker photo uploads (admin only)

**Implementation:**

```typescript
// Photo upload handler
const handlePhotoUpload = async (file: File) => {
  // Browser requests camera/photo library access automatically
  // When user selects file from device
}

// HTML Input
<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => handlePhotoUpload(e.target.files[0])}
/>
```

**Browser Behavior:**

- Clicking input automatically opens file picker
- User selects from camera, gallery, or files
- Browser handles permission management

**For Android/iOS:**

- Browser prompts: "Allow camera access?"
- User can select from gallery (no camera needed)
- Or take new photo with camera

---

### Required Permissions by Feature

| Feature | Permission | Requirement | Role |
|---------|-----------|-------------|------|
| Show User Location | Geolocation | Optional | All |
| Update Staff Location | Geolocation | Must Allow | Staff |
| Upload Worker Photo | Camera/Storage | Required | Admin |
| Find Nearby Workers | Geolocation | Recommended | Client |

---

## 📲 Mobile Integration

### Web App on Mobile

**Current Status:** ✅ Fully responsive

**To Use on Mobile:**

1. Open browser on phone/tablet
2. Navigate to app URL
3. Bookmark or add to home screen
4. Works just like desktop

**Responsive Breakpoints:**

- Mobile: < 640px (full width)
- Tablet: 640px - 1024px (two column)
- Desktop: > 1024px (full layout)

---

### Android App Integration

**Option 1: Web View (Easiest)**

**Using React Native:**

```typescript
import { WebView } from 'react-native-webview'

export default function MapsScreen() {
  return (
    <WebView
      source={{ uri: 'https://your-app.com/workers-map' }}
      geolocationEnabled={true}
      javaScriptEnabled={true}
    />
  )
}
```

**Permissions in AndroidManifest.xml:**

```xml
<manifest>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</manifest>
```

**Option 2: Native React Native**

**Install Dependencies:**

```bash
npm install react-native-geolocation-service
npm install react-native-maps
npm install @react-native-permissions/permissions
```

**Component:**

```typescript
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker } from 'react-native-maps'

export default function AndroidWorkersMap() {
  const [location, setLocation] = useState(null)
  const [workers, setWorkers] = useState([])

  useEffect(() => {
    // Request permission
    Geolocation.requestAuthorization('whenInUse').then(() => {
      // Get current position
      Geolocation.getCurrentPosition(
        (pos) => setLocation(pos.coords),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      )
    })
  }, [])

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location?.latitude || 40.7128,
        longitude: location?.longitude || -74.006,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {workers.map(worker => (
        <Marker
          key={worker.id}
          coordinate={{
            latitude: worker.currentLocation.lat,
            longitude: worker.currentLocation.lng,
          }}
          title={worker.name}
        />
      ))}
    </MapView>
  )
}
```

---

### iOS App Integration

**Option 1: Web View**

**Using React Native:**

```swift
import WebKit

class MapsViewController: UIViewController, WKNavigationDelegate {
  let webView = WKWebView()
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    let url = URL(string: "https://your-app.com/workers-map")!
    webView.load(URLRequest(url: url))
    
    view.addSubview(webView)
  }
}
```

**Permissions in Info.plist:**

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby workers</string>

<key>NSCameraUsageDescription</key>
<string>We need camera access to upload worker photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library</string>
```

**Option 2: Native React Native**

**Install Dependencies:**

```bash
npm install @react-native-community/geolocation
npm install react-native-maps
npm install react-native-permissions
```

**Component:**

```typescript
import Geolocation from '@react-native-community/geolocation'
import MapView, { Marker } from 'react-native-maps'
import { check, request, PERMISSIONS } from 'react-native-permissions'

export default function iOSWorkersMap() {
  const [location, setLocation] = useState(null)
  const [workers, setWorkers] = useState([])

  useEffect(() => {
    // Check permission
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(result => {
      if (result !== 'granted') {
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
      }
    })

    // Get location
    Geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords),
      (err) => console.error(err)
    )
  }, [])

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location?.latitude || 40.7128,
        longitude: location?.longitude || -74.006,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {workers.map(worker => (
        <Marker
          key={worker.id}
          coordinate={{
            latitude: worker.currentLocation.lat,
            longitude: worker.currentLocation.lng,
          }}
          title={worker.name}
        />
      ))}
    </MapView>
  )
}
```

---

## 🔌 API Reference

### Backend Endpoints

#### Get All Workers

```http
GET /api/workers?role=CLIENT&userId=USER_ID
```

**Parameters:**

- `role` (enum): admin, staff, client
- `userId` (string): Current user ID

**Response (Client):**

```json
{
  "success": true,
  "data": [
    {
      "id": "wrk-001",
      "name": "Carlos Rodriguez",
      "availability": "available",
      "currentLocation": {
        "lat": 40.7128,
        "lng": -74.006,
        "timestamp": 1768947309941
      },
      "zone": "North Zone",
      "specialties": ["electrical-fencing", "surveillance-cameras"],
      "rating": 4.8,
      "reviewCount": 127
    }
  ],
  "count": 3
}
```

---

#### Update Worker Location

```http
POST /api/workers/:workerId/location
```

**Headers:**

```
Content-Type: application/json
```

**Query:**

```
role=staff&userId=wrk-001
```

**Body:**

```json
{
  "lat": 40.7580,
  "lng": -73.9855
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wrk-001",
    "currentLocation": {
      "lat": 40.758,
      "lng": -73.9855,
      "timestamp": 1768947542280
    }
  },
  "message": "Location updated successfully"
}
```

---

#### Update Availability

```http
POST /api/workers/:workerId/availability
```

**Query:**

```
role=staff&userId=wrk-001
```

**Body:**

```json
{
  "availability": "busy"
}
```

**Valid Values:** available | busy | offline

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wrk-001",
    "availability": "busy"
  },
  "message": "Availability updated successfully"
}
```

---

#### Upload Worker Photo

```http
POST /api/workers/:workerId/photo
```

**Headers:**

```
Content-Type: multipart/form-data
```

**Query:**

```
role=admin&userId=admin-001
```

**Body:** (multipart form data)

```
photo: <binary file>
```

**Accepted Formats:** JPEG, PNG, WEBP
**Max Size:** 5MB

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "wrk-001",
    "photo": "uploads/workers/wrk-001-1768947542280.jpg"
  },
  "message": "Photo uploaded successfully"
}
```

---

#### Get Zones

```http
GET /api/workers/zones/list
```

**Response:**

```json
{
  "success": true,
  "data": [
    "North Zone",
    "East Zone",
    "South Zone",
    "West Zone"
  ]
}
```

---

## 💡 Examples & Use Cases

### Use Case 1: Client Finding Emergency Electrician

**Scenario:** Client's circuit breaker failed at home

**Steps:**

1. Client opens app
2. Navigates to "Find Workers"
3. Allows geolocation access
4. Map shows 3 available electricians nearby
5. Clicks electrician with highest rating (4.9 stars)
6. Views details: 15 min away, certified
7. Clicks "Call" button
8. Connected to worker directly
9. Schedules appointment

**API Calls:**

```
GET /api/workers?role=client&userId=client-123
```

---

### Use Case 2: Staff Updating Location

**Scenario:** Field technician finishing job, heading to next one

**Steps:**

1. Staff logs in
2. Views workers map
3. Clicks "Share My Location"
4. Allows geolocation
5. GPS coordinates captured
6. Location updates on map in real-time
7. Manager sees updated position
8. Staff changes availability: Busy → Available

**API Calls:**

```
POST /api/workers/wrk-001/location?role=staff&userId=wrk-001
{
  "lat": 40.7580,
  "lng": -73.9855
}

POST /api/workers/wrk-001/availability?role=staff&userId=wrk-001
{
  "availability": "available"
}
```

---

### Use Case 3: Admin Onboarding New Worker

**Scenario:** Admin adding new staff member with photo

**Steps:**

1. Admin navigates to admin panel
2. Clicks "Add New Worker"
3. Fills form: name, email, zone, specialties
4. Clicks "Upload Photo"
5. Selects from camera/gallery
6. Photo uploads automatically
7. Worker appears on map
8. Admin assigns to North Zone
9. Worker receives login credentials

**API Calls:**

```
POST /api/workers
{
  "name": "John Smith",
  "email": "john@example.com",
  "zone": "North Zone",
  "specialties": ["electrical-fencing"]
}

POST /api/workers/wrk-004/photo?role=admin
(photo: image file)
```

---

### Use Case 4: Manager Monitoring Field Team

**Scenario:** Manager viewing all staff locations in real-time

**Steps:**

1. Manager logs in as staff (or admin)
2. Views workers map
3. Sees all team members' locations
4. Green = available, yellow = busy, gray = offline
5. Filters to show only "North Zone"
6. Sees 2 workers in zone
7. Clicks worker to see details
8. Can contact worker or check availability
9. Monitors productivity throughout day

**Feature Usage:**

- Zone filter dropdown
- Color-coded availability
- Worker detail cards
- Call/Email quick actions

---

## 🔐 Security Considerations

### Data Privacy

**Geolocation Data:**

- Only stored on device during session
- Sent to server for location update
- Can be deleted by user
- Not shared with unauthorized parties

**Photo Storage:**

- Stored on server in `/backend/uploads/workers/`
- Accessible only via API with authentication
- 5MB size limit prevents abuse
- JPEG/PNG/WEBP only (no executables)

**API Calls:**

- Role-based access control on all endpoints
- userId parameter prevents cross-user access
- Staff can only update own profile
- Admin needed for sensitive operations

---

### Permissions Best Practices

**Geolocation:**

```typescript
// Show permission status to user
const checkLocationPermission = async () => {
  if (!navigator.geolocation) {
    return 'not-supported'
  }
  // Attempt to get position
  navigator.geolocation.getCurrentPosition(
    () => 'granted',
    () => 'denied'
  )
}
```

**Camera/Storage:**

- Let browser handle file input
- User explicitly chooses files
- No background access needed

---

## 📚 Additional Resources

### Documentation Files

- `MAP_DATA_IMPLEMENTATION.md` - Full API reference
- `INTEGRATION_GUIDE.md` - Integration steps
- `QUICKSTART_MAP_DATA.md` - Quick start guide

### External Resources

- **Leaflet:** <https://leafletjs.com/>
- **Google Maps:** <https://developers.google.com/maps>
- **Mapbox:** <https://docs.mapbox.com/>
- **Azure Maps:** <https://docs.microsoft.com/azure/azure-maps/>

### Libraries

- `leaflet` - Lightweight map library
- `@react-google-maps/api` - Google Maps React wrapper
- `react-map-gl` - Mapbox React component
- `react-native-maps` - Native maps for mobile
- `react-native-geolocation-service` - Geolocation for mobile

---

## 🆘 Troubleshooting

### Workers Not Showing on Map

**Issue:** Map loads but no worker markers visible

**Solutions:**

1. Check backend is running: `curl http://localhost:3001/api/workers`
2. Verify API returns data: Check browser Network tab
3. Check worker roles: Client sees only available workers
4. Check zone filter: May be filtering out all workers
5. Zoom out: Markers may be outside current view

---

### Location Not Updating

**Issue:** "Share My Location" doesn't work

**Solutions:**

1. Check browser permission: Settings → Site Permissions → Location
2. Check HTTPS: Location only works on HTTPS (except localhost)
3. Check timeout: May need to wait 7 seconds
4. Check role: Only staff/admin can update location
5. Check userId: Must match current user

---

### Photo Upload Failing

**Issue:** Photo upload returns error

**Solutions:**

1. Check file size: Max 5MB
2. Check file type: Only JPEG/PNG/WEBP
3. Check permissions: Only admin can upload
4. Check role param: Must include `role=admin` in query
5. Check uploads directory: `/backend/uploads/workers/` must exist

---

### Map Centering on Wrong Location

**Issue:** Map centers to default (New York) instead of user location

**Solutions:**

1. Allow geolocation: Browser permission may be blocked
2. Check GPS: Device may not have GPS
3. Wait for position: May need 5-10 seconds to get fix
4. Check error message: UI may show "Unable to access location"
5. Manual center: Users can drag map manually

---

## 🎓 Learning Path

### Beginner

1. Read this document
2. Open app and explore as different roles
3. Review API endpoints
4. Try basic features

### Intermediate

1. Study code: `WorkersMapEnhanced.tsx`
2. Study API: `backend/src/routes/workers.js`
3. Understand RBAC: `src/utils/rbac.ts`
4. Test API calls with curl

### Advanced

1. Integrate different map provider (Google/Mapbox)
2. Build mobile app with React Native
3. Add real-time updates with WebSockets
4. Implement advanced clustering/heatmaps
5. Custom marker styling

---

## 📞 Support

For issues or questions:

1. Check this document first
2. Review code comments
3. Check API responses
4. Enable browser DevTools
5. Check console for errors
6. Review backend logs

---

**Last Updated:** January 20, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
