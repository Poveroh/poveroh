import '@poveroh/ui/globals.css'
import { Providers } from './providers'
import appConfig from '../config'

const getFallbackProps = () => ({
    locale: 'en',
    direction: 'ltr'
})

// Use server-side env vars for metadata (server-side only)
const getAppName = () => appConfig.name || 'Poveroh'

export const metadata = {
    title: {
        template: `%s | ${getAppName()}`,
        default: getAppName()
    }
}

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default async function RootLayout({ children }: RootLayoutProps) {
    const { locale, direction } = await getFallbackProps()

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <body className='antialiased'>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
