import { NextResponse } from 'next/server'

export async function GET() {
    const env = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '',
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? '',
        LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
        NODE_ENV: process.env.NODE_ENV ?? 'production'
    }

    const body = `window.__ENV = ${JSON.stringify(env)};`

    return new NextResponse(body, {
        headers: {
            'Content-Type': 'text/javascript; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    })
}
