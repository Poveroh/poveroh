import '@poveroh/ui/globals.css'
import { Providers } from './providers'
import appConfig from '../config'
import { PublicEnvScript } from 'next-runtime-env'

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

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default async function RootLayout({ children }: RootLayoutProps) {
    const { locale, direction } = await getFallbackProps()

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <head>
                <PublicEnvScript />
            </head>
            <body className='antialiased'>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
