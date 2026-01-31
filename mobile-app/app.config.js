import 'dotenv/config'

export default ({ config }) => {
  return {
    ...config,
    name: process.env.APP_NAME || config.name || 'RepairPro Mobile',
    slug: process.env.APP_ID ? process.env.APP_ID.split('.').pop() : config.slug || 'mobile-app',
    version: process.env.APP_VERSION || config.version || '1.0.0',
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
      VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || '',
      ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES === 'true',
      ENABLE_REALTIME_UPDATES: process.env.ENABLE_REALTIME_UPDATES === 'true',
      ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
      ENABLE_CHATBOT: process.env.ENABLE_CHATBOT === 'true',
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
      VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
      VITE_ANALYTICS_ID: process.env.VITE_ANALYTICS_ID || '',
      VITE_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY || '',
      VITE_PAYPAL_CLIENT_ID: process.env.VITE_PAYPAL_CLIENT_ID || '',
      APP_ID: process.env.APP_ID || '',
      APP_VERSION_CODE: process.env.APP_VERSION_CODE || '',
    },
  }
}
