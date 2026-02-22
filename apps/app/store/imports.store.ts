import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import type { Import, Transaction } from '@/lib/api-client'

type ImportStore = {
    importCacheList: Import[]
    currentImport: Import | null
    pendingTransactions: Transaction[]
    addImport: (importItems: Import[]) => void
    editImport: (importItem: Import) => void
    setImports: (imports: Import[]) => void
    removeImport: (importId: string) => void
    getImport: (importId: string) => Import | null
    setCurrentImport: (importItem: Import | null) => void
    cleanCurrentImports: () => void
    setPendingTransactions: (transactions: Transaction[]) => void
    updatePendingTransaction: (transaction: Transaction) => void
    removePendingTransaction: (transactionId: string) => void
}

export const useImportStore = create<ImportStore>((set, get) => ({
    importCacheList: [],
    currentImport: null,
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

    cleanCurrentImports: () => {
        set(() => ({
            currentImport: null,
            pendingTransactions: []
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

    setCurrentImport: importItem => {
        set(() => ({
            currentImport: importItem,
            pendingTransactions: importItem ? importItem.transactions || [] : []
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
