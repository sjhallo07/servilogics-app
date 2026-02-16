import { AuthProvider } from './auth'
import Layout from './components/layouts'
import Theme from './components/template/Theme'
import Views from './views'
import { BrowserRouter } from 'react-router-dom'
import appConfig from './configs/app.config'
import './locales'
import { Analytics } from '@vercel/analytics/react'

if (appConfig.enableMock) {
    import('./mock')
}

function App()
{
    return (
        <Theme>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                    <Layout>
                        <Views />
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
            <Analytics />
        </Theme>
    )
}

export default App
