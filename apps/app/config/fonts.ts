import { Inter } from 'next/font/google'

// Downloaded at build time and served by the app, so self-hosted instances make no runtime request to Google
export const inter = Inter({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
    display: 'swap',
    variable: '--font-inter'
})
