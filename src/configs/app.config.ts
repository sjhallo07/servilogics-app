export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: import.meta.env.VITE_API_PREFIX || '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    // Primary UI language (Spanish). English remains available as secondary/fallback.
    locale: 'es',
    accessTokenPersistStrategy: 'cookies',
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
}

export default appConfig
