# Servilogics Mobile App

React Native mobile application built with Expo that wraps the Servilogics frontend in a WebView with native functionality.

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on physical devices)
- EAS CLI (`npm install -g eas-cli`) - for production builds

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` and replace placeholder values with your actual credentials:

- **Firebase credentials** - Get from [Firebase Console](https://console.firebase.google.com)
- **Google Maps API key** - Get from [Google Cloud Console](https://console.cloud.google.com)
- **API URLs** - Update to point to your backend server

### 3. Run Development Server

```bash
npm start
# or
npx expo start
```

Then:

- Scan the QR code with **Expo Go** app (Android/iOS)
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator

## 📦 Building for Production

### EAS Build (Recommended)

1. **Login to Expo**

```bash
npx eas login
```

1. **Configure EAS** (already configured in this project)

```bash
# View eas.json for build profiles:
# - development: Dev builds with Expo Go
# - preview: APK for internal testing
# - production: App bundle for stores
```

1. **Build APK** (for direct installation)

```bash
npx eas build --profile preview --platform android
```

1. **Build for Production** (for Google Play Store)

```bash
npx eas build --profile production --platform android
```

1. **Build for iOS** (requires Apple Developer account)

```bash
npx eas build --profile production --platform ios
```

### Local Build (Alternative)

See [Expo local builds documentation](https://docs.expo.dev/build-reference/local-builds/)

## 🌍 Environment Profiles

The app uses different `.env` configurations through EAS build profiles:

### Development

- Uses local backend: `http://10.0.13.106:3001`
- Debug mode enabled
- Development Firebase project

### Preview

- Same as development but without debug tools
- For internal testing

### Production

- Production API: `https://api.servilogics.com`
- Production Firebase project
- Optimized builds

## 📱 App Architecture

```
servilogics-app/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home (WebView)
│   │   ├── explore.tsx      # Explore tab
│   │   └── services.tsx     # Services tab
│   └── _layout.tsx          # Root layout
├── assets/                   # Images, fonts
├── components/              # Reusable components
├── constants/               # Theme, config
├── hooks/                   # Custom hooks
└── services/                # API services
```

### Key Features

- **WebView Integration**: Renders the Vite frontend inside a native WebView
- **Native Navigation**: Bottom tabs for easy navigation
- **Firebase Auth**: Authentication integration
- **Google Maps**: Location services
- **Offline Support**: Works with cached content

## 🔐 Security

- `.env` file is in `.gitignore` - never commit credentials
- Use different Firebase projects for dev/staging/production
- Rotate API keys regularly
- Use environment-specific credentials in EAS builds

## 📝 Configuration Files

- **app.json** - Expo app configuration, splash screen, icons
- **eas.json** - EAS Build profiles and environment variables
- **.env** - Local environment variables (not committed)
- **.env.example** - Template for environment variables

## 🐛 Troubleshooting

### WebView not loading

- Check that frontend dev server is running on configured port
- Verify `WEB_APP_URL` in `.env` is correct
- Check localhost permissions in `app.json` (iOS: NSAppTransportSecurity)

### Build failed

- Verify all required environment variables are set
- Check EAS build limits on free plan
- Review build logs: `npx eas build:list`

### Firebase errors

- Ensure Firebase credentials match your project
- Check Firebase project settings
- Verify API key restrictions in Google Cloud Console

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)

## 🔄 Update Over-The-Air (OTA)

Publish updates without rebuilding:

```bash
npx eas update --channel preview --message "Bug fixes"
```

## 📞 Support

For issues and questions, contact the development team or open an issue in the repository.

---

**Project ID**: `3f169799-1e03-415a-9cdd-f7e151b2f882`  
**Expo Username**: `@sjhallo07/servilogics-app`
