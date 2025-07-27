import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IAccount } from '@poveroh/types'

type AccountStore = {
    accountCacheList: IAccount[]
    addAccount: (account: IAccount) => void
    editAccount: (account: IAccount) => void
    setAccounts: (accounts: IAccount[]) => void
    removeAccount: (accountId: string) => void
    getAccount: (accountId: string) => IAccount | null
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
    removeAccount: accountId => {
        set(state => ({
            accountCacheList: state.accountCacheList.filter(item => item.id !== accountId)
        }))
    },
    getAccount: accountId => {
        const accountCacheList = get().accountCacheList
        const index = accountCacheList.findIndex(item => item.id === accountId)
        if (index !== -1) {
            return accountCacheList[index] || null
        }
        return null
    }
}))
