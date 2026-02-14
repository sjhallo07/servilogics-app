export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}


// Detecta si está en React Native (Expo) o en Web (Vite)
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

const env = isReactNative ? process.env : (typeof import.meta !== 'undefined' ? import.meta.env : {});

const appConfig: AppConfig = {
    apiPrefix: env.VITE_API_PREFIX || '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    // Primary UI language (Spanish). English remains available as secondary/fallback.
    locale: 'es',
    accessTokenPersistStrategy: 'cookies',
    enableMock: env.VITE_ENABLE_MOCK === 'true',
}

export default appConfig
