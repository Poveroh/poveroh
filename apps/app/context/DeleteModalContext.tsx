'use client'

import React, { createContext } from 'react'
import { useDeleteModalStore, DeleteModalStore } from '@/store/delete.modal.store'

const DeleteModalContext = createContext<DeleteModalStore | undefined>(undefined)

type DeleteModalContextProviderProps = {
    children: React.ReactNode
}

export function DeleteModalContextProvider({ children }: DeleteModalContextProviderProps) {
    const modalStore = useDeleteModalStore()

    return <DeleteModalContext.Provider value={modalStore}>{children}</DeleteModalContext.Provider>
}

export default DeleteModalContext
