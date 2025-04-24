import { create } from 'zustand'
import { remove } from 'lodash'
import { IBankAccount } from '@poveroh/types'
import { BankAccountService } from '@/services/bankaccount.service'

const bankAccountService = new BankAccountService()

type BankAccountStore = {
    bankAccountCacheList: IBankAccount[]
    add: (bankAccount: IBankAccount) => void
    edit: (bankAccount: IBankAccount) => void
    set: (bankAccounts: IBankAccount[]) => void
    remove: (bankAccount_id: string) => Promise<boolean>
    get: (bankAccount_id: string) => IBankAccount | null
    fetch: () => Promise<void>
}

export const useBankAccountStore = create<BankAccountStore>((set, get) => ({
    bankAccountCacheList: [],
    add: (bankAccount: IBankAccount) => {
        set(state => {
            const newList = [...state.bankAccountCacheList, bankAccount]
            return {
                bankAccountCacheList: newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },
    edit: (bankAccount: IBankAccount) => {
        set(state => {
            const index = state.bankAccountCacheList.findIndex(item => item.id === bankAccount.id)
            if (index !== -1) {
                const newList = [...state.bankAccountCacheList]
                newList[index] = bankAccount
                return {
                    bankAccountCacheList: newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
            }
            return state
        })
    },
    set: (bankAccounts: IBankAccount[]) => {
        set(() => ({
            bankAccountCacheList: bankAccounts
        }))
    },
    remove: async (bankAccount_id: string): Promise<boolean> => {
        const res = await bankAccountService.delete(bankAccount_id)

        if (!res) {
            throw new Error('Error deleting bank account')
        }

        set(state => {
            const newList = [...state.bankAccountCacheList]
            remove(newList, item => item.id === bankAccount_id)
            return {
                bankAccountCacheList: newList
            }
        })

        return true
    },
    get: (bankAccount_id: string) => {
        const bankAccountCacheList = get().bankAccountCacheList
        const index = bankAccountCacheList.findIndex(item => item.id === bankAccount_id)
        if (index !== -1) {
            return bankAccountCacheList[index] || null
        }
        return null
    },
    fetch: async () => {
        const res = await bankAccountService.read<IBankAccount[]>()
        set(() => ({
            bankAccountCacheList: res
        }))
    }
}))
