import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from './services/auth.service'

export function middleware(request: NextRequest) {
    const auth = new AuthService()
    const path = request.nextUrl.pathname

    const isPublicPath = path == '/sign-in'

    const token = request.cookies.get('token')?.value || ''

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const response = NextResponse.next()
    response.headers.set('x-auth', token)

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public|logo|icon).*)']
}
