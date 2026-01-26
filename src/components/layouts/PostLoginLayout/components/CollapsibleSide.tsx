import type { CommonProps } from '@/@types/common'
import LayoutBase from '@/components//template/LayoutBase'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import { HealthStatus } from '@/components/shared'
import Chatbot from '@/components/shared/Chatbot'
import { CartButton, CurrencySelector, LanguageSelector, ThemeModeSelector } from '@/components/shared/HeaderExtras'
import Header from '@/components/template/Header'
import MobileNav from '@/components/template/MobileNav'
import SideNav from '@/components/template/SideNav'
import SideNavToggle from '@/components/template/SideNavToggle'
import { APP_NAME } from '@/constants/app.constant'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import useResponsive from '@/utils/hooks/useResponsive'

const CollapsibleSide = ({ children }: CommonProps) =>
{
    const { larger, smaller } = useResponsive()

    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                {smaller.lg && <MobileNav />}
                                {larger.lg && <SideNavToggle />}
                            </>
                        }
                        headerMiddle={
                            <div className="text-base md:text-lg font-semibold truncate">
                                {APP_NAME}
                            </div>
                        }
                        headerEnd={
                            <div className="flex items-center gap-3">
                                <ThemeModeSelector />
                                <LanguageSelector />
                                <CurrencySelector />
                                <CartButton />
                                <HealthStatus intervalMs={15000} />
                                <UserProfileDropdown hoverable={false} />
                            </div>
                        }
                    />
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </div>
            </div>
            <Chatbot />
        </LayoutBase>
    )
}

export default CollapsibleSide
