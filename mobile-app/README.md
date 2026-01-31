# mobile-app — Build APK (Expo / EAS)

Quick steps to build an Android APK for this Expo project using EAS Build.

1. Install EAS CLI (if not installed):

```bash
npm install -g eas-cli
```

1. Login to your Expo account:

```bash
eas login
```

1. (Optional) Configure the project for EAS builds:

```bash
cd mobile-app
eas build:configure
```

1. Create a preview APK (internal distribution):

```bash
npm run eas:build:android:apk
```

1. Create a production app bundle (AAB) ready for Play Store submission:

```bash
npm run eas:build:android:bundle
```

Notes:

- The `preview` profile in `eas.json` produces an APK you can install on devices/emulators.
- For production builds you'll need to manage Android signing credentials (see `eas credentials` and the Expo docs).
- For local builds use `eas build --platform android --local` (requires Android build environment).
