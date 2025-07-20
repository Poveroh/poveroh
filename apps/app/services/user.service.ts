import { server } from '@/lib/server'
import { IPasswordToChange, IUser } from '@poveroh/types'
import { BaseService } from './base.service'

export class UserService extends BaseService<IUser> {
    constructor() {
        super('/user')
    }

    async updatePassword(id: string, passwords: IPasswordToChange): Promise<boolean> {
        return await server.put<boolean>(`/user/${id}/set-password`, passwords)
    }
}
