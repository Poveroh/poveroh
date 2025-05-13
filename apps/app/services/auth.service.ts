import { IUser, IUserToSave, type IUserLogin } from '@poveroh/types'
import { server } from '@/lib/server'

export class AuthService {
    async signIn(user: IUserLogin): Promise<boolean> {
        return await server.post<boolean>('/auth/login', user)
    }

    async signUp(user: IUserToSave): Promise<IUser> {
        return await server.post<IUser>('/auth/sign-up', user)
    }
}
