'use client'

import React, { createContext } from 'react'
import { useDrawerStore } from '@/store/drawer.store'
import { DrawerStore } from '@/types/drawer'

const DrawerContext = createContext<DrawerStore | undefined>(undefined)

type DrawerContextProviderProps = {
    children: React.ReactNode
}

export function DrawerContextProvider({ children }: DrawerContextProviderProps) {
    const drawerStore = useDrawerStore()

    return <DrawerContext.Provider value={drawerStore}>{children}</DrawerContext.Provider>
}

export default DrawerContext
