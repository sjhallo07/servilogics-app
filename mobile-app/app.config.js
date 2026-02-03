import 'dotenv/config'

export default ({ config }) => {
  // Clean the API URL: remove leading '=' and trailing slashes
  const rawApiUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  const cleanedApiUrl = rawApiUrl.replace(/^=/, '').replace(/\/$/, '');

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
      API_BASE_URL: cleanedApiUrl,
      ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES === 'true',
      ENABLE_REALTIME_UPDATES: process.env.ENABLE_REALTIME_UPDATES === 'true',
      ENABLE_CHATBOT: process.env.ENABLE_CHATBOT === 'true',
      eas: {
        projectId: '642c8675-a9c6-4b86-b449-9de26a1d5280',
      },
    },
  }
}
