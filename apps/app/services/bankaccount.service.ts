import { server } from '@/lib/server'
import { BankAccountType, IBankAccount, IItem } from '@poveroh/types'

export class BankAccountService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTypeList(t: any): IItem[] {
        return [
            {
                value: BankAccountType.ONLINE_BANK,
                label: t('bankAccounts.types.online')
            },
            {
                value: BankAccountType.BANK_ACCOUNT,
                label: t('bankAccounts.types.bank')
            },
            {
                value: BankAccountType.CIRCUIT,
                label: t('bankAccounts.types.circuit')
            },
            {
                value: BankAccountType.DEPOSIT_BANK,
                label: t('bankAccounts.types.deposit')
            },
            {
                value: BankAccountType.BROKER,
                label: t('bankAccounts.types.broker')
            }
        ]
    }

    async add(bankAccountToAdd: FormData) {
        return await server.post<IBankAccount>('/bank-account/add', bankAccountToAdd, true)
    }

    async save(bankAccountToSave: FormData) {
        return await server.post<IBankAccount>('/bank-account/save', bankAccountToSave, true)
    }

    async delete(bankAccountToDelete: string) {
        return await server.post<boolean>('/bank-account/delete', { id: bankAccountToDelete })
    }

    async read<T>(id?: string | string[]): Promise<T> {
        return await server.post<T>('/bank-account/read', { id })
    }
}
