import '@poveroh/ui/globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import appConfig from '@/config'

const getFallbackProps = () => ({
    locale: 'en',
    direction: 'ltr'
})

export const metadata = {
    title: {
        template: `%s | ${appConfig.name}`,
        default: appConfig.name
    }
}

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default async function RootLayout({ children }: RootLayoutProps) {
    const { locale, direction } = await getFallbackProps()

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <head>
                {/* Load runtime environment before React hydration */}
                {/* Load env.js before React hydrates so window.__ENV is available */}
                <Script src='/api/env' strategy='beforeInteractive' />
            </head>
            <body className='antialiased'>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
