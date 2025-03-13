import { server } from '@/lib/server'
import { IBankAccount } from '@poveroh/types'

export class BankAccountService {
    async add(bankAccountToAdd: IBankAccount) {
        return await server.post<IBankAccount>('/bank-account/add', bankAccountToAdd)
    }

    async save(bankAccountToSave: IBankAccount) {
        return await server.post<IBankAccount>('/bank-account/save', bankAccountToSave)
    }

    async delete(bankAccountToDelete: string) {
        return await server.post<boolean>('/bank-account/delete', { id: bankAccountToDelete })
    }

    async read<T>(id?: string | string[]): Promise<T> {
        return await server.post<T>('/bank-account/read', id)
    }
}
