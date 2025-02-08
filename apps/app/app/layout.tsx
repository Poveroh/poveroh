import '@poveroh/ui/globals.css'
import { ThemeProviders } from '@/components/themeProvider'

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className='antialiased'>
                <ThemeProviders>{children}</ThemeProviders>
            </body>
        </html>
    )
}
