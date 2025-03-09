import { type IUserLogin } from '@poveroh/types'
import { redirect } from 'next/navigation'
import { server } from '@/lib/server'
import { encryptString, isValidEmail } from '@poveroh/utils'
import { cookie, storage } from '@/lib/storage'
import { isEmpty } from 'lodash'

export class AuthService {
    async signIn(user: IUserLogin): Promise<boolean> {
        if (!isValidEmail(user.email)) throw new Error('E-mail not valid')

        if (isEmpty(user.password)) throw new Error('Password not valid')

        user.password = await encryptString(user.password)

        const res = await server.post<boolean>('/auth/login', user)

        if (res) {
            window.location.href = '/dashboard'
            return true
        } else {
            return false
        }
    }

    isAuthenticate() {
        return cookie.has('token')
    }

    logout(redirectToLogin?: boolean) {
        storage.clear()

        cookie.remove('token')

        if (redirectToLogin) redirect('/sign-in')
    }
}
