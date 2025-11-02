import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Allow static assets and favicons to pass through
    if (
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/public') ||
        path.includes('.png') ||
        path.includes('.jpg') ||
        path.includes('.jpeg') ||
        path.includes('.gif') ||
        path.includes('.svg') ||
        path.includes('.ico') ||
        path.includes('.webp') ||
        path === '/favicon.ico' ||
        path === '/apple-touch-icon.png' ||
        path === '/apple-touch-icon-precomposed.png'
    ) {
        return NextResponse.next()
    }

    console.log('Middleware check start')

    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/logout', '/change-password']

    const sessionCookie = getSessionCookie(request, {
        cookiePrefix: 'poveroh_auth_'
    })

    // Check if user has a valid session
    const isAuthenticated = !!sessionCookie

    // Debug cookies
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(cookie => cookie.name.startsWith('poveroh_auth_'))

    console.log('Middleware check:', {
        path,
        isAuthenticated,
        sessionCookie: !!sessionCookie,
        authCookies: authCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        allCookiesCount: allCookies.length
    })

    // If not authenticated and trying to access protected route, redirect to sign-in
    if (!isAuthenticated && !authPaths.includes(path) && path !== '/') {
        console.log('Redirecting to sign-in: not authenticated')
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // If authenticated and trying to access auth pages (except logout), redirect to dashboard
    if (isAuthenticated && authPaths.includes(path) && path !== '/logout') {
        console.log('Redirecting to dashboard: already authenticated')
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Handle root path redirect
    if (path === '/') {
        const redirectUrl = isAuthenticated ? '/dashboard' : '/sign-in'
        console.log(`Redirecting root to: ${redirectUrl}`)
        return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         * - files with extensions (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)'
    ]
}
