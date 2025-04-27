import { server } from '@/lib/server'
import { storage } from '@/lib/storage'
import { IUser, IUserToSave } from '@poveroh/types'
import { encryptString } from '@poveroh/utils/dist'

export class UserService {
    async me(readFromServer?: boolean): Promise<IUser> {
        let user: IUser | null

        if (readFromServer) {
            user = await server.post<IUser>('/user/me', {})
            storage.set('user', JSON.stringify(user))
        } else user = storage.parse<IUser>('user')

        if (!user) throw new Error('User not found')

        return user
    }

    async save(userToSave: IUserToSave): Promise<boolean> {
        return await server.post<boolean>('/user/save', userToSave)
    }

    async updatePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        oldPassword = await encryptString(oldPassword)
        newPassword = await encryptString(newPassword)

        return await server.post<boolean>('/user/set-password', { oldPassword, newPassword })
    }
}
