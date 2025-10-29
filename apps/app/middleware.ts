import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    // Allow API routes and static assets to pass through without auth redirects
    if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/public')) {
        return NextResponse.next()
    }
    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/logout']

    // Check for both old and new authentication tokens during migration
    const legacyToken = request.cookies.get('token')?.value || ''
    const sessionCookie =
        request.cookies.get('better-auth.session_token') ||
        request.cookies.get('session') ||
        request.cookies.get('auth-token')

    // User is authenticated if they have either token type
    const isAuthenticated = !!legacyToken || !!sessionCookie?.value

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
