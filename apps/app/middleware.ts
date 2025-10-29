import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow API routes and static assets to pass through without auth redirects
    if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/public')) {
        return NextResponse.next()
    }

    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/logout']

    // Check for legacy token
    const legacyToken = request.cookies.get('token')?.value || ''

    // Check for better-auth session cookies with our custom prefix
    const betterAuthCookies = [
        'poveroh_auth_session',
        'poveroh_auth_session_token',
        'better-auth.session_token',
        'session_token',
        'auth-token',
        'session',
        'auth.session-token',
        'better_auth_session',
        '__Secure-better-auth.session_token'
    ]

    const hasBetterAuthSession = betterAuthCookies.some(cookieName => request.cookies.get(cookieName)?.value)

    // User is authenticated if they have either legacy token or better-auth session
    const isAuthenticated = !!legacyToken || hasBetterAuthSession

    // Debug: check for specific cookies with our prefix
    const poverahAuthSession = request.cookies.get('poveroh_auth_session')?.value
    const poverahAuthToken = request.cookies.get('poveroh_auth_session_token')?.value

    console.log(`[Middleware] Path: ${path}`)
    console.log(`[Middleware] Poveroh session cookie:`, !!poverahAuthSession)
    console.log(`[Middleware] Poveroh token cookie:`, !!poverahAuthToken)
    console.log(
        `[Middleware] Legacy: ${!!legacyToken}, BetterAuth: ${hasBetterAuthSession}, Authenticated: ${isAuthenticated}`
    )

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
