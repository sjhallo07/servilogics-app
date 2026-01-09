import authRoute from '@/configs/routes.config/authRoute'
import { useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import SimpleHeader from '@/components/template/SimpleHeader'
import type { CommonProps } from '@/@types/common'

const PreLoginLayout = ({ children }: CommonProps) =>
{
    const location = useLocation()

    const { pathname } = location

    const isAuthPath = authRoute.some((route) => route.path === pathname)

    if (isAuthPath) {
        return (
            <div className="flex flex-auto flex-col h-[100vh]">
                <AuthLayout>{children}</AuthLayout>
            </div>
        )
    }

    // For public (non-auth) pages, show a simple header with app name
    return (
        <div className="flex flex-auto flex-col min-h-screen">
            <SimpleHeader />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}

export default PreLoginLayout
