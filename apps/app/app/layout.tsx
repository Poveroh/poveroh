import type { Metadata } from 'next'

import '@poveroh/ui/main.css'

export const metadata: Metadata = {
    title: 'Poveroh',
    description: 'A unified platform to track your wealth',
    icons: {
        icon: '/favicon.ico'
    }
}

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang='en'>
            <body>{children}</body>
        </html>
    )
}
