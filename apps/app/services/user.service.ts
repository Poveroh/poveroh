import { server } from '@/lib/server'
import { IPasswordToChange, IUser, IUserToSave } from '@poveroh/types'

export class UserService {
    async me(): Promise<IUser> {
        return await server.get<IUser>('/user/me', true)
    }

    async save(userToSave: IUserToSave): Promise<boolean> {
        return await server.put<boolean>('/user/save', userToSave)
    }

    async updatePassword(passwords: IPasswordToChange): Promise<boolean> {
        return await server.put<boolean>('/user/set-password', passwords)
    }
}
