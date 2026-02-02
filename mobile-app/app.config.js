import 'dotenv/config'

export default ({ config }) => {
  return {
    ...config,
    name: 'servilogics-mobile-app',
    slug: 'mobile',
    version: '1.0.0',
    android: {
      package: 'com.servilogics.mobile',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.servilogics.mobile'
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '1.9.24',
          },
        },
      ],
    ],
    extra: {
      ...config.extra,
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
      VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
      ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES === 'true',
      ENABLE_REALTIME_UPDATES: process.env.ENABLE_REALTIME_UPDATES === 'true',
      ENABLE_CHATBOT: process.env.ENABLE_CHATBOT === 'true',
      APP_ID: 'com.servilogics.mobile',
      APP_VERSION_CODE: '1',
      eas: {
        projectId: '642c8675-a9c6-4b86-b449-9de26a1d5280',
      },
    },
  }
}
