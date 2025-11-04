import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IFinancialAccount } from '@poveroh/types'

type AccountStore = {
    accountCacheList: IFinancialAccount[]
    addAccount: (account: IFinancialAccount) => void
    editAccount: (account: IFinancialAccount) => void
    setAccounts: (accounts: IFinancialAccount[]) => void
    removeAccount: (financialAccountId: string) => void
    getAccount: (financialAccountId: string) => IFinancialAccount | null
}

export const useAccountStore = create<AccountStore>((set, get) => ({
    accountCacheList: [],
    addAccount: account => {
        set(state => {
            const list = [...state.accountCacheList, account]
            return {
                accountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            }
        })
    },
    editAccount: account => {
        set(state => {
            const index = state.accountCacheList.findIndex(item => item.id === account.id)
            if (index !== -1) {
                const list = cloneDeep(state.accountCacheList)
                list[index] = account
                return {
                    accountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            }
            return state
        })
    },
    setAccounts: accounts => {
        set(() => ({
            accountCacheList: accounts
        }))
    },
    removeAccount: financialAccountId => {
        set(state => ({
            accountCacheList: state.accountCacheList.filter(item => item.id !== financialAccountId)
        }))
    },
    getAccount: financialAccountId => {
        const accountCacheList = get().accountCacheList
        const index = accountCacheList.findIndex(item => item.id === financialAccountId)
        if (index !== -1) {
            return accountCacheList[index] || null
        }
        return null
    }
}))
