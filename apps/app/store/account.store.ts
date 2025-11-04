import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IFinancialAccount } from '@poveroh/types'

type FinancialAccountStore = {
    financialAccountCacheList: IFinancialAccount[]
    addFinancialAccount: (account: IFinancialAccount) => void
    editFinancialAccount: (account: IFinancialAccount) => void
    setFinancialAccounts: (accounts: IFinancialAccount[]) => void
    removeFinancialAccount: (financialAccountId: string) => void
    getFinancialAccount: (financialAccountId: string) => IFinancialAccount | null
}

export const useFinancialAccountStore = create<FinancialAccountStore>((set, get) => ({
    financialAccountCacheList: [],
    addFinancialAccount: account => {
        set(state => {
            const list = [...state.financialAccountCacheList, account]
            return {
                financialAccountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            }
        })
    },
    editFinancialAccount: account => {
        set(state => {
            const index = state.financialAccountCacheList.findIndex(item => item.id === account.id)
            if (index !== -1) {
                const list = cloneDeep(state.financialAccountCacheList)
                list[index] = account
                return {
                    financialAccountCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            }
            return state
        })
    },
    setFinancialAccounts: accounts => {
        set(() => ({
            financialAccountCacheList: accounts
        }))
    },
    removeFinancialAccount: financialAccountId => {
        set(state => ({
            financialAccountCacheList: state.financialAccountCacheList.filter(item => item.id !== financialAccountId)
        }))
    },
    getFinancialAccount: financialAccountId => {
        const financialAccountCacheList = get().financialAccountCacheList
        const index = financialAccountCacheList.findIndex(item => item.id === financialAccountId)
        if (index !== -1) {
            return financialAccountCacheList[index] || null
        }
        return null
    }
}))
