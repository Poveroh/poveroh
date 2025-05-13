import { server } from '@/lib/server'
import { IPasswordToChange, IUser, IUserToSave } from '@poveroh/types'

export class UserService {
    async me(): Promise<IUser> {
        return await server.post<IUser>('/user/me', {})
    }

    async save(userToSave: IUserToSave): Promise<boolean> {
        return await server.post<boolean>('/user/save', userToSave)
    }

    async updatePassword(passwords: IPasswordToChange): Promise<boolean> {
        return await server.post<boolean>('/user/set-password', passwords)
    }
}
