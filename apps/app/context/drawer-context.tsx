'use client'

import React, { createContext } from 'react'
import { useDrawerStore, DrawerStore } from '@/store/drawer.store'

const DrawerContext = createContext<DrawerStore | undefined>(undefined)

type DrawerContextProviderProps = {
    children: React.ReactNode
}

export function DrawerContextProvider({ children }: DrawerContextProviderProps) {
    const DrawerStore = useDrawerStore()

    return <DrawerContext.Provider value={DrawerStore}>{children}</DrawerContext.Provider>
}

export default DrawerContext
