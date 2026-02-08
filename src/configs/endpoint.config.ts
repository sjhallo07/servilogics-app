export const apiPrefix = '/api'

const endpointConfig = {
    signIn: '/sign-in',
    signOut: '/sign-out',
    signUp: '/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    oauthGoogle: '/oauth/google',
    oauthGithub: '/oauth/github',
    // Added for connectivity verification
    health: '/health',
    settingsContact: '/settings/contact',
    workers: '/workers',
    inventory: '/inventory/items',
    quotes: '/quotes',
    jobs: '/jobs',
    feedback: '/feedback',
    loyalty: '/loyalty',
    contact: '/contact',
    clients: '/clients',
    clientsImport: '/clients/import',
}

export default endpointConfig
