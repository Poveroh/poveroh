import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IImport } from '@poveroh/types'

type ImportStore = {
    importCacheList: IImport[]
    addImport: (importItems: IImport[]) => void
    editImport: (importItem: IImport) => void
    setImports: (imports: IImport[]) => void
    removeImport: (importId: string) => void
    getImport: (importId: string) => IImport | null
}

export const useImportStore = create<ImportStore>((set, get) => ({
    importCacheList: [],

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
    }
}))
