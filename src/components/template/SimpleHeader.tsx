import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import { APP_NAME } from '@/constants/app.constant'

const SimpleHeader = () =>
{
    return (
        <Header
            className="shadow-sm dark:shadow-2xl"
            container
            headerStart={<HeaderLogo />}
            headerMiddle={
                <div className="text-base md:text-lg font-semibold truncate">
                    {APP_NAME}
                </div>
            }
        />
    )
}

export default SimpleHeader
