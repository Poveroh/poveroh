import '@poveroh/ui/globals.css'
import { ThemeProviders } from '@/providers/themeProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const messages = await getMessages()
    const locale = await getLocale()

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className='antialiased'>
                <NextIntlClientProvider messages={messages}>
                    <ThemeProviders>{children}</ThemeProviders>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
