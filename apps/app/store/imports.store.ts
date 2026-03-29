import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { ImportData, TransactionData } from '@poveroh/types'

type ImportStore = {
    importCacheList: ImportData[]
    currentImport: ImportData | null
    pendingTransactions: TransactionData[]
    addImport: (importItems: ImportData[]) => void
    editImport: (importItem: ImportData) => void
    setImports: (imports: ImportData[]) => void
    removeImport: (importId: string) => void
    getImport: (importId: string) => ImportData | null
    setCurrentImport: (importItem: ImportData | null) => void
    cleanCurrentImports: () => void
    setPendingTransactions: (transactions: TransactionData[]) => void
    updatePendingTransaction: (transaction: TransactionData) => void
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
