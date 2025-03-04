import { server } from '@/lib/server'
import { storage } from '@/lib/storage'
import { IUser } from '@poveroh/types'
import { encryptString } from '@poveroh/utils/dist'

export class UserService {
    async me(readFromServer?: boolean): Promise<IUser> {
        let user: IUser

        if (readFromServer) {
            user = await server.post<IUser>('/user/me', {})
            storage.set('user', JSON.stringify(user))
        } else user = storage.parse<IUser>('user')

        return user
    }

    async save(userToSave: IUser): Promise<boolean> {
        return await server.post<boolean>('/user/save', userToSave)
    }

    async updatePassword(newPassword: string): Promise<boolean> {
        newPassword = await encryptString(newPassword)

        return await server.post<boolean>('/user/set-password', newPassword)
    }
}
