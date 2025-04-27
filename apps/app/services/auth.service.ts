import { type IUserLogin } from '@poveroh/types'
import { server } from '@/lib/server'
import { encryptString, isValidEmail } from '@poveroh/utils'
import { isEmpty } from 'lodash'

export class AuthService {
    async signIn(user: IUserLogin): Promise<boolean> {
        if (!isValidEmail(user.email)) throw new Error('E-mail not valid')

        if (isEmpty(user.password)) throw new Error('Password not valid')

        user.password = await encryptString(user.password)

        return await server.post<boolean>('/auth/login', user)
    }
}
