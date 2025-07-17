import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IBankAccount } from '@poveroh/types'

type BankAccountStore = {
    bankAccountCacheList: IBankAccount[]
    addBankAccount: (bankAccount: IBankAccount) => void
    editBankAccount: (bankAccount: IBankAccount) => void
    setBankAccounts: (bankAccounts: IBankAccount[]) => void
    removeBankAccount: (bankAccountId: string) => void
    getBankAccount: (bankAccountId: string) => IBankAccount | null
}

export const useBankAccountStore = create<BankAccountStore>((set, get) => ({
    bankAccountCacheList: [],
    addBankAccount: bankAccount => {
        set(state => {
            const list = [...state.bankAccountCacheList, bankAccount]
            return {
                bankAccountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
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
                    bankAccountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            }
            return state
        })
    },
    setBankAccounts: bankAccounts => {
        set(() => ({
            bankAccountCacheList: bankAccounts
        }))
    },
    removeBankAccount: bankAccountId => {
        set(state => ({
            bankAccountCacheList: state.bankAccountCacheList.filter(item => item.id !== bankAccountId)
        }))
    },
    getBankAccount: bankAccountId => {
        const bankAccountCacheList = get().bankAccountCacheList
        const index = bankAccountCacheList.findIndex(item => item.id === bankAccountId)
        if (index !== -1) {
            return bankAccountCacheList[index] || null
        }
        return null
    }
}))
