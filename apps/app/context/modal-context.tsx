'use client'

import React, { createContext } from 'react'
import { useModalStore, ModalStoreState } from '@/store/modal.store'

const ModalContext = createContext<ModalStoreState | undefined>(undefined)

type ModalContextProviderProps = {
    children: React.ReactNode
}

export function ModalContextProvider({ children }: ModalContextProviderProps) {
    const modalStore = useModalStore()

    return <ModalContext.Provider value={modalStore}>{children}</ModalContext.Provider>
}

export default ModalContext
