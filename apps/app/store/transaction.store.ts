import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { ITransaction } from '@poveroh/types'

type TransactionStore = {
    transactionCacheList: ITransaction[]
    addTransaction: (transaction: ITransaction) => void
    appendTransactions: (transactions: ITransaction[]) => void
    editTransaction: (transaction: ITransaction) => void
    setTransaction: (transactions: ITransaction[]) => void
    removeTransaction: (transaction_id: string) => void
    getTransaction: (transaction_id: string) => ITransaction | null
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    transactionCacheList: [],
    addTransaction: transaction => {
        set(state => {
            const list = [...state.transactionCacheList, transaction]
            return {
                transactionCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },
    appendTransactions: transactions => {
        set(state => {
            const list = [...state.transactionCacheList]
            list.push(...transactions)
            return {
                transactionCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },
    editTransaction: transaction => {
        set(state => {
            const index = state.transactionCacheList.findIndex(item => item.id === transaction.id)
            if (index !== -1) {
                const list = cloneDeep(state.transactionCacheList)
                list[index] = transaction
                return {
                    transactionCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
            }
            return state
        })
    },
    setTransaction: transactions => {
        set(() => ({
            transactionCacheList: transactions
        }))
    },
    removeTransaction: transaction_id => {
        set(state => ({
            transactionCacheList: state.transactionCacheList.filter(item => item.id !== transaction_id)
        }))
    },
    getTransaction: transaction_id => {
        const list = get().transactionCacheList
        const index = list.findIndex(item => item.id === transaction_id)
        if (index !== -1) {
            return list[index] || null
        }
        return null
    }
}))
