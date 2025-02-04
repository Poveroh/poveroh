import type { Metadata } from 'next'

import '../styles/style.css'

export const metadata: Metadata = {
    title: 'Poveroh',
    description: 'A unified platform to track your wealth'
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
