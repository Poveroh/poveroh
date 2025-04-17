'use client'

import { BankAccountService } from '@/services/bankaccount.service'
import { CategoryService } from '@/services/category.service'
import { IBankAccount, ICategory } from '@poveroh/types/dist'
import { createContext, useEffect, useState } from 'react'

type CacheContextType = {
    categoryList: ICategory[]
    bankAccountList: IBankAccount[]
    setBankAccountList: (newBankAccountList: IBankAccount[]) => void
    setCategoryList: (newCategoryList: ICategory[]) => void
}

const initialContext: CacheContextType = {
    categoryList: [],
    bankAccountList: [],
    setBankAccountList: (newBankAccountList: IBankAccount[]) => {},
    setCategoryList: (newCategoryList: ICategory[]) => {}
}

const CacheContext = createContext<CacheContextType>(initialContext)

type AppContextProviderProps = {
    children: React.ReactNode
}

export function CacheContextProvider({ children }: AppContextProviderProps) {
    const categoryService = new CategoryService()
    const bankaccountService = new BankAccountService()

    const [categoryList, setCategoryListState] = useState<ICategory[]>([])
    const [bankAccountList, setBankAccountListState] = useState<IBankAccount[]>([])

    const fetchData = async () => {
        const readedCategory = await categoryService.read<ICategory[]>()
        const readedBankAccount = await bankaccountService.read<IBankAccount[]>()

        setCategoryList(readedCategory)
        setBankAccountListState(readedBankAccount)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const setCategoryList = (newCategoryList: ICategory[]) => {
        setCategoryListState(newCategoryList)
    }

    const setBankAccountList = (newBankAccountList: IBankAccount[]) => {
        setBankAccountListState(newBankAccountList)
    }

    const context = { categoryList, bankAccountList, setCategoryList, setBankAccountList }

    return <CacheContext.Provider value={context}>{children}</CacheContext.Provider>
}

export default CacheContext
