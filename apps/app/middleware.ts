import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/logout']
    const token = request.cookies.get('token')?.value || ''

    if (!token && !authPaths.includes(path)) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if (token && authPaths.includes(path) && path !== '/logout') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public|logo|icon).*)']
}
