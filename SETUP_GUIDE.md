# 🚀 Local Development Setup Guide

Complete guide to set up the Ecme-lite-cesar project locally with GitHub Copilot integration.

## 📋 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make script executable
chmod +x setup-dev-env.sh

# Run full setup
./setup-dev-env.sh

# Or quick setup (skip Copilot config)
./setup-dev-env.sh --quick
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install
npm install -D nodemon concurrently cross-env

# 2. Install map packages
npm install leaflet react-leaflet @types/leaflet

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Create .env files
cp .env.example .env
cp backend/.env.example backend/.env

# 5. Start development servers
./start-dev.sh
```

---

## 🔧 Prerequisites

Before running the setup script, ensure you have:

### Required

- ✅ **Node.js** 18+ ([download](https://nodejs.org/))
- ✅ **npm** 8+ (comes with Node.js)
- ✅ **Git** ([download](https://git-scm.com/))

### Recommended

- ⭐ **VS Code** ([download](https://code.visualstudio.com/))
- ⭐ **GitHub Copilot Extension**
- ⭐ **Docker** (for PostgreSQL)

### Optional

- 🔷 **Google Maps API Key** (for Google Maps integration)
- 🔷 **Mapbox Token** (for Mapbox integration)

---

## 📊 What the Setup Script Does

### 1. Checks Prerequisites

Verifies Node.js, npm, Git, and optional tools

### 2. Installs Dependencies

- Frontend: React, Tailwind, Leaflet, Framer Motion
- Backend: Express, Multer, CORS
- Dev tools: Nodemon, Concurrently

### 3. Configures Environment

Creates `.env` files with:

- API ports (Frontend: 5175, Backend: 3001)
- Map provider (Leaflet by default)
- Feature flags

### 4. Sets Up GitHub Copilot

- Creates `.copilot-config.json`
- Generates `.copilot-prompts.md` with task templates
- Provides VS Code integration guide

### 5. Creates Utility Scripts

- `start-dev.sh` - Start all services
- `stop-dev.sh` - Stop all services
- `test-maps.sh` - Test map functionality
- `copilot-helper.sh` - Copilot quick tips

---

## 🚀 Starting Development

### Start All Services

```bash
./start-dev.sh
```

Services will start on:

- **Frontend:** <http://localhost:5175>
- **Backend:** <http://localhost:3001/api>

### Available Dashboards

```
Admin Dashboard:    http://localhost:5175/admin/workers-map
Staff Dashboard:    http://localhost:5175/staff/workers
Client Dashboard:   http://localhost:5175/find-workers
Backend API:        http://localhost:3001/api
```

### Stop Services

```bash
./stop-dev.sh
```

Or press `Ctrl+C` in the terminal running `start-dev.sh`

---

## 🗺️ Map Configuration

### Current Setup: Leaflet (Default)

- ✅ Free, open-source
- ✅ No API key needed
- ✅ Works with OpenStreetMap

**Configuration:**

```env
VITE_MAP_PROVIDER=leaflet
```

### Switch to Google Maps

**Step 1: Get API Key**

```bash
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable "Maps JavaScript API"
4. Create API Key
```

**Step 2: Update .env**

```env
VITE_MAP_PROVIDER=google
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Switch to Mapbox

**Step 1: Get Access Token**

```bash
1. Go to https://mapbox.com
2. Create account and get token
```

**Step 2: Update .env**

```env
VITE_MAP_PROVIDER=mapbox
VITE_MAPBOX_ACCESS_TOKEN=your_token_here
```

---

## 🤖 GitHub Copilot Integration

### Setup in VS Code

**Step 1: Install Extension**

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "GitHub Copilot"
4. Install official extension by GitHub

**Step 2: Authenticate**

1. Press Cmd+Shift+P
2. Type "Copilot: Sign In"
3. Authorize in browser

**Step 3: Use Copilot**

- **Inline suggestions:** Start typing, suggestions appear
- **Quick fix:** Cmd+I in editor
- **Chat:** Cmd+Shift+I (if Copilot Chat installed)

### Copilot Prompts for This Project

Access prompts in `.copilot-prompts.md`

**Common Tasks:**

```typescript
// Generate map component
// Create a React component for worker markers on Leaflet map
// Include popups with worker details and status colors
```

```javascript
// Generate API route
// Create Express route for updating worker location
// Include validation and error handling
```

```typescript
// Generate utility function
// Create function to calculate distance between coordinates
// Implement Haversine formula
```

Run helper script:

```bash
./copilot-helper.sh prompts
./copilot-helper.sh setup
./copilot-helper.sh components
./copilot-helper.sh api
```

---

## 🧪 Testing

### Test Maps

```bash
./test-maps.sh
```

Tests:

- ✅ Workers API endpoint
- ✅ Zones API endpoint
- ✅ Frontend server
- ✅ Backend API
- ✅ Geolocation support

### Manual Testing

**Step 1: Open Client Dashboard**

```
http://localhost:5175/find-workers
```

**Step 2: Allow Geolocation**

- Browser will prompt for location access
- Click "Allow"

**Step 3: Verify Map Loads**

- Map should center on your location
- Worker markers visible
- "You" marker shows your position

**Step 4: Test Features**

- Filter by zone
- Click on workers
- Test call/email buttons
- Check console for errors

---

## 📁 Project Structure

```
Ecme-lite-cesar/
├── src/
│   ├── views/
│   │   ├── workers/
│   │   │   └── WorkersMapEnhanced.tsx    ← Main map component
│   │   └── admin/
│   │       └── WorkerManagement.tsx      ← Admin panel
│   ├── services/
│   │   └── WorkerService.ts             ← API calls
│   ├── utils/
│   │   └── rbac.ts                      ← Role-based access
│   └── @types/
│       └── services.ts                  ← Type definitions
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── workers.js               ← Worker API
│   │   └── index.js                     ← Server setup
│   ├── uploads/                         ← Photo storage
│   └── .env                             ← Backend config
│
├── setup-dev-env.sh                     ← Setup script
├── start-dev.sh                         ← Start services
├── stop-dev.sh                          ← Stop services
├── test-maps.sh                         ← Test script
├── copilot-helper.sh                    ← Copilot help
├── .env                                 ← Frontend config
└── .copilot-config.json                 ← Copilot config
```

---

## ⚙️ Environment Variables

### Frontend (.env)

```env
# Server
NODE_ENV=development
APP_PORT=5175
API_PORT=3001

# Maps
MAP_PROVIDER=leaflet
VITE_MAP_PROVIDER=leaflet
VITE_API_URL=http://localhost:3001

# Optional: Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_key

# Optional: Mapbox
VITE_MAPBOX_ACCESS_TOKEN=your_token

# Features
VITE_ENABLE_WORKERS_MAP=true
VITE_ENABLE_INVENTORY=true

# Defaults
VITE_DEFAULT_CURRENCY=USD
VITE_DEFAULT_LANGUAGE=en
```

### Backend (backend/.env)

```env
# Server
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ecme_lite

# Uploads
UPLOAD_DIR=uploads

# Agent
AGENT_TIMEOUT_MS=60000
AGENT_HOST_ALLOWLIST=localhost,127.0.0.1

# Authentication
JWT_SECRET=dev_secret_key
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solution:**

```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9

# Or change port in .env
API_PORT=3002
```

### Maps Not Loading

**Problem:** Blank map or no markers

**Solutions:**

1. Check browser console for errors (F12)
2. Verify backend is running
3. Check `VITE_API_URL` in `.env`
4. Clear browser cache (Cmd+Shift+Delete)
5. Try different map provider

### Geolocation Permission Denied

**Problem:** "Unable to access your location"

**Solutions:**

1. Check browser settings → Location
2. Grant permission when prompted
3. Check browser DevTools Sensors (simulate location)
4. Try incognito mode

### API Returns 403 Forbidden

**Problem:** "Only staff and admins can..." error

**Solutions:**

1. Check user role in localStorage
2. Verify `role` and `userId` query params
3. Check RBAC in `src/utils/rbac.ts`
4. Ensure admin/staff testing in correct dashboard

### Dependencies Installation Failed

**Problem:** npm install error

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `MAPS_DASHBOARD_GUIDE.md` | Complete map functionality guide |
| `MAP_DATA_IMPLEMENTATION.md` | API reference and schemas |
| `INTEGRATION_GUIDE.md` | Integration steps |
| `.copilot-prompts.md` | Copilot task templates |
| `setup-dev-env.sh` | Automated setup |

---

## 🚀 Development Workflow

### 1. Make Changes

```bash
# Edit component
vim src/views/workers/WorkersMapEnhanced.tsx

# Or use your editor
code .
```

### 2. Test Immediately

- Changes auto-reload in browser
- Check console for errors

### 3. Use Copilot

- Press Cmd+I for suggestions
- Use prompts from `.copilot-prompts.md`
- Ask for refactoring help

### 4. Commit Changes

```bash
git add .
git commit -m "Describe changes"
git push origin main
```

---

## 🎓 Learning Resources

### Maps

- [Leaflet Docs](https://leafletjs.com/)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation)

### Frontend

- [React Docs](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend

- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [REST API Design](https://restfulapi.net/)

### Copilot

- [Copilot Docs](https://github.com/features/copilot)
- [Copilot Chat](https://github.com/github-copilot/chat_waitlist)

---

## 💡 Tips & Tricks

### Use Copilot for Code Generation

```bash
# In VS Code, press Cmd+I and paste:
"Create a React hook for geolocation with error handling"
```

### Watch Files for Changes

```bash
# Frontend changes auto-reload (Vite)
# Backend requires restart after changes

# For live backend reload:
npm run dev:backend  # With nodemon
```

### Debug in Browser

```
F12 → Console tab
- Check for errors
- Inspect API responses
- Test geolocation
- Simulate locations
```

### Fast Database Reset

```bash
./db-utils.sh reset
```

---

## ✅ Verification Checklist

Before starting development:

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] VS Code installed (recommended)
- [ ] GitHub Copilot extension installed
- [ ] `.env` file created
- [ ] Dependencies installed
- [ ] `start-dev.sh` executable
- [ ] Backend and frontend starting
- [ ] Map loading with markers
- [ ] Geolocation working
- [ ] API endpoints responding

---

## 🆘 Get Help

### Check Documentation

1. Specific issue? Check MAPS_DASHBOARD_GUIDE.md
2. API question? Check MAP_DATA_IMPLEMENTATION.md
3. Integration help? Check INTEGRATION_GUIDE.md
4. Code generation? Check .copilot-prompts.md

### Debug Steps

1. Check browser console (F12)
2. Check backend logs: `tail -f /tmp/backend.log`
3. Test API with curl: `curl http://localhost:3001/api/workers`
4. Check network tab for failed requests
5. Verify environment variables in `.env`

---

## 📞 Quick Commands

```bash
# Start everything
./start-dev.sh

# Stop everything
./stop-dev.sh

# Test maps
./test-maps.sh

# Get Copilot help
./copilot-helper.sh

# View backend logs
tail -f /tmp/backend.log

# View frontend logs
tail -f /tmp/frontend.log

# Check ports in use
lsof -i :3001
lsof -i :5175
```

---

**Last Updated:** January 20, 2026  
**Status:** ✅ Ready for Development  
**Next:** Run `./setup-dev-env.sh` to begin! 🚀
