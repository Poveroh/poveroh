import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow API routes and static assets to pass through without auth redirects
    if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/public')) {
        return NextResponse.next()
    }

    console.log('Middleware check start')

    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/logout']

    const isAuthenticated = getSessionCookie(request, {
        cookiePrefix: 'poveroh_auth_'
    })

    console.log('Middleware check:', { path, isAuthenticated })

    if (!isAuthenticated && !authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/logout', request.url))
    }

    if (isAuthenticated && authPaths.includes(path) && path !== '/logout') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public|logo|icon).*)']
}
