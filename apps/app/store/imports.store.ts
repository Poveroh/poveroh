import { create } from 'zustand'
import { cloneDeep } from 'lodash'
import { IImports } from '@poveroh/types'

type ImportsStore = {
    importsCacheList: IImports[]
    addImport: (importItem: IImports[]) => void
    editImport: (importItem: IImports) => void
    setImports: (imports: IImports[]) => void
    removeImport: (import_id: string) => void
    getImport: (import_id: string) => IImports | null
}

export const useImportsStore = create<ImportsStore>((set, get) => ({
    importsCacheList: [],

    addImport: importItem => {
        set(state => {
            const list = [...state.importsCacheList, ...importItem]
            return {
                importsCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            }
        })
    },

    editImport: importItem => {
        set(state => {
            const index = state.importsCacheList.findIndex(item => item.id === importItem.id)
            if (index !== -1) {
                const list = cloneDeep(state.importsCacheList)
                list[index] = importItem
                return {
                    importsCacheList: list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
            }
            return state
        })
    },

    setImports: imports => {
        set(() => ({
            importsCacheList: imports.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        }))
    },

    removeImport: import_id => {
        set(state => ({
            importsCacheList: state.importsCacheList.filter(item => item.id !== import_id)
        }))
    },

    getImport: import_id => {
        const importsCacheList = get().importsCacheList
        return importsCacheList.find(item => item.id === import_id) || null
    }
}))
