import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    console.log('Middleware checking path:', pathname)

    // Allow static, API, auth and proxied API paths through
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/public') ||
        pathname === '/favicon.ico' ||
        // Any path that looks like a file (has an extension) should be allowed
        /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
        return NextResponse.next()
    }

    const authPages = new Set(['/sign-in', '/sign-up', '/forgot-password', '/logout', '/change-password'])

    const sessionCookie = getSessionCookie(request, {
        cookiePrefix: 'poveroh_auth_'
    })

    console.log('Session cookie found:', sessionCookie)

    // Unauthenticated users: redirect to sign-in for protected pages
    if (!sessionCookie && !authPages.has(pathname) && pathname !== '/') {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Authenticated users shouldn't visit auth pages
    if (sessionCookie && authPages.has(pathname) && pathname !== '/logout') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Root redirect
    if (pathname === '/') {
        return NextResponse.redirect(new URL(sessionCookie ? '/dashboard' : '/sign-in', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*).*)']
}
