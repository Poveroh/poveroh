import '@poveroh/ui/globals.css'
import { Providers } from './providers'
import appConfig from '../config'
import { PublicEnvProvider } from 'next-runtime-env'

const getFallbackProps = () => ({
    locale: 'en',
    direction: 'ltr'
})

export const metadata = {
    title: {
        template: `%s | ${appConfig.name || 'Poveroh'}`,
        default: appConfig.name || 'Poveroh'
    }
}

export const dynamic = 'force-dynamic'

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default async function RootLayout({ children }: RootLayoutProps) {
    const { locale, direction } = await getFallbackProps()

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <body className='antialiased'>
                <PublicEnvProvider>
                    <Providers>{children}</Providers>
                </PublicEnvProvider>
            </body>
        </html>
    )
}
