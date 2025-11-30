import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IImport, ITransaction } from '@poveroh/types'

type ImportStore = {
    importCacheList: IImport[]
    pendingTransactions: ITransaction[]
    addImport: (importItems: IImport[]) => void
    editImport: (importItem: IImport) => void
    setImports: (imports: IImport[]) => void
    removeImport: (importId: string) => void
    getImport: (importId: string) => IImport | null
    setPendingTransactions: (transactions: ITransaction[]) => void
    updatePendingTransaction: (transaction: ITransaction) => void
    removePendingTransaction: (transactionId: string) => void
}

export const useImportStore = create<ImportStore>((set, get) => ({
    importCacheList: [],
    pendingTransactions: [],

    addImport: importItems => {
        set(state => {
            const list = [...state.importCacheList, ...importItems]
            return {
                importCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
            }
        })
    },

    editImport: importItem => {
        set(state => {
            const index = state.importCacheList.findIndex(item => item.id === importItem.id)
            if (index !== -1) {
                const list = cloneDeep(state.importCacheList)
                list[index] = importItem
                return {
                    importCacheList: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                }
            }
            return state
        })
    },

    setImports: imports => {
        set(() => ({
            importCacheList: imports.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        }))
    },

    removeImport: importId => {
        set(state => ({
            importCacheList: state.importCacheList.filter(item => item.id !== importId)
        }))
    },

    getImport: importId => {
        const importCacheList = get().importCacheList
        return importCacheList.find(item => item.id === importId) || null
    },

    setPendingTransactions: transactions => {
        set(() => ({
            pendingTransactions: transactions
        }))
    },

    updatePendingTransaction: transaction => {
        set(state => {
            const index = state.pendingTransactions.findIndex(t => t.id === transaction.id)
            if (index !== -1) {
                const list = cloneDeep(state.pendingTransactions)
                list[index] = transaction
                return {
                    pendingTransactions: list
                }
            }
            return state
        })
    },

    removePendingTransaction: transactionId => {
        set(state => ({
            pendingTransactions: state.pendingTransactions.filter(t => t.id !== transactionId)
        }))
    }
}))
