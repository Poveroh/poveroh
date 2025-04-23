'use client'

import { IBankAccount, ICategory, ISubcategory } from '@poveroh/types/dist'
import { add, remove } from 'lodash'
import { createContext, useState } from 'react'

type CacheContextType = {
    categoryCacheList: ICategory[]
    bankAccountCacheList: IBankAccount[]
    categoryCache: {
        add: (category: ICategory) => void
        addSubcategory: (subcategory: ISubcategory) => void
        edit: (category: ICategory) => void
        set: (category: ICategory[]) => void
        remove: (category: ICategory) => void
        get: (category_id: string) => ICategory | null
    }
    bankAccountCache: {
        add: (bankAccount: IBankAccount) => void
        edit: (bankAccount: IBankAccount) => void
        set: (bankAccount: IBankAccount[]) => void
        remove: (bankAccount: IBankAccount) => void
        get: (bankAccount_id: string) => IBankAccount | null
    }
}

const initialContext: CacheContextType = {
    categoryCacheList: [],
    bankAccountCacheList: [],
    categoryCache: {
        add: () => {},
        addSubcategory: () => {},
        edit: () => {},
        set: () => {},
        remove: () => {},
        get: () => null
    },
    bankAccountCache: {
        add: () => {},
        edit: () => {},
        set: () => {},
        remove: () => {},
        get: () => null
    }
}

const CacheContext = createContext<CacheContextType>(initialContext)

type AppContextProviderProps = {
    children: React.ReactNode
}

export function CacheContextProvider({ children }: AppContextProviderProps) {
    const [categoryCacheList, setCategoryCacheListState] = useState<ICategory[]>([])
    const [bankAccountCacheList, setBankAccountCacheListState] = useState<IBankAccount[]>([])

    const bankAccountCache = {
        add: (bankAccount: IBankAccount) => {
            setBankAccountCacheListState(prev => {
                const newList = [...prev, bankAccount]
                return newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            })
        },
        edit: (bankAccount: IBankAccount) => {
            setBankAccountCacheListState(prev => {
                const index = prev.findIndex(item => item.id === bankAccount.id)
                if (index !== -1) {
                    const newList = [...prev]
                    newList[index] = bankAccount
                    return newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
                return prev
            })
        },
        set: (bankAccount: IBankAccount[]) => {
            setBankAccountCacheListState(bankAccount)
        },
        remove: (bankAccount: IBankAccount) => {
            setBankAccountCacheListState(prev => {
                const newList = [...prev]
                remove(newList, item => item.id === bankAccount.id)
                return newList
            })
        },
        get: (bankAccount_id: string) => {
            const index = bankAccountCacheList.findIndex(item => item.id === bankAccount_id)
            if (index !== -1) {
                return bankAccountCacheList[index] || null
            }
            return null
        }
    }

    const categoryCache = {
        add: (category: ICategory) => {
            setCategoryCacheListState(prev => {
                const newList = [...prev, category]
                return newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            })
        },
        addSubcategory: (subcategory: ISubcategory) => {
            setCategoryCacheListState(prev => {
                const index = prev.findIndex(item => item.id === subcategory.category_id)
                if (index !== -1) {
                    const newList = [...prev]
                    newList[index].subcategories = [...(newList[index].subcategories || []), subcategory]
                    return newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
                return prev
            })
        },
        edit: (category: ICategory) => {
            setCategoryCacheListState(prev => {
                const index = prev.findIndex(item => item.id === category.id)
                if (index !== -1) {
                    const newList = [...prev]
                    newList[index] = category
                    return newList.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                }
                return prev
            })
        },
        set: (category: ICategory[]) => {
            setCategoryCacheListState(category)
        },
        remove: (category: ICategory) => {
            setCategoryCacheListState(prev => {
                const newList = [...prev]
                remove(newList, item => item.id === category.id)
                return newList
            })
        },
        get: (category_id: string) => {
            const index = categoryCacheList.findIndex(item => item.id === category_id)
            if (index !== -1) {
                return categoryCacheList[index] || null
            }
            return null
        }
    }

    const context = { categoryCache, bankAccountCache, categoryCacheList, bankAccountCacheList }

    return <CacheContext.Provider value={context}>{children}</CacheContext.Provider>
}

export default CacheContext
