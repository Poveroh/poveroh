import { server } from '@/lib/server'
import { storage } from '@/lib/storage'
import { IUser, ServerRequest } from '@poveroh/types'
import { encryptString } from '@poveroh/utils/dist'

export class UserService {
    async me(readFromServer?: boolean): Promise<IUser> {
        let user: IUser

        if (readFromServer) {
            user = await server.send<IUser>(ServerRequest.POST, '/user/me', {}, 'me')

            storage.set('user', JSON.stringify(user))
        } else user = storage.parse<IUser>('user')

        return user
    }

    async save(userToSave: IUser): Promise<boolean> {
        return await server.send<boolean>(ServerRequest.POST, '/user/save', userToSave, 'save')
    }

    async updatePassword(newPassword: string): Promise<boolean> {
        newPassword = await encryptString(newPassword)

        return await server.send<boolean>(
            ServerRequest.POST,
            '/user/set-password',
            newPassword,
            'setpassword'
        )
    }

    fullName(reverse?: boolean): string {
        const user: IUser = storage.parse<IUser>('user')

        if (user == null) return ''

        return reverse ? `${user.surname} ${user.name}` : `${user.name} ${user.surname}`
    }
}
