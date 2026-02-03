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
    workers: '/workers',
    inventory: '/inventory/items',
}

export default endpointConfig
