import { type IUserLogin, ServerRequest } from '@poveroh/types'
import { send } from '@/lib/server'
import router from 'next/router'

function signIn(user: IUserLogin) {
    send<boolean>(ServerRequest.POST, '/auth/login', user, 'login').then(() => {
        router.push('/dashboard')
    })
}

export { signIn }
