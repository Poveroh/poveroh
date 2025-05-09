import { create } from 'zustand'
import { cloneDeep, remove } from 'lodash'
import { IBankAccount } from '@poveroh/types'

type BankAccountStore = {
    bankAccountCacheList: IBankAccount[]
    addBankAccount: (bankAccount: IBankAccount) => void
    editBankAccount: (bankAccount: IBankAccount) => void
    setBankAccount: (bankAccounts: IBankAccount[]) => void
    removeBankAccount: (bankAccount_id: string) => void
    getBankAccount: (bankAccount_id: string) => IBankAccount | null
}

export const useBankAccountStore = create<BankAccountStore>((set, get) => ({
    bankAccountCacheList: [],
    addBankAccount: bankAccount => {
        set(state => {
            const list = [...state.bankAccountCacheList, bankAccount]
            return {
                bankAccountCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },
    editBankAccount: bankAccount => {
        set(state => {
            const index = state.bankAccountCacheList.findIndex(item => item.id === bankAccount.id)
            if (index !== -1) {
                const list = cloneDeep(state.bankAccountCacheList)
                list[index] = bankAccount
                return {
                    bankAccountCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
            }
            return state
        })
    },
    setBankAccount: bankAccounts => {
        set(() => ({
            bankAccountCacheList: bankAccounts
        }))
    },
    removeBankAccount: bankAccount_id => {
        set(state => {
            const list = cloneDeep(state.bankAccountCacheList)
            remove(list, item => item.id === bankAccount_id)
            return {
                bankAccountCacheList: list
            }
        })
    },
    getBankAccount: bankAccount_id => {
        const bankAccountCacheList = get().bankAccountCacheList
        const index = bankAccountCacheList.findIndex(item => item.id === bankAccount_id)
        if (index !== -1) {
            return bankAccountCacheList[index] || null
        }
        return null
    }
}))
