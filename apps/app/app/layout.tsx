import '@poveroh/ui/globals.css'
import { Providers } from './providers'

const getFallbackProps = () => ({
    locale: 'en',
    direction: 'ltr'
})

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const { locale, direction } = await getFallbackProps()

    return (
        <html lang={locale} dir={direction} suppressHydrationWarning>
            <body className='antialiased'>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
