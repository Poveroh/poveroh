'use client'

import React, { createContext } from 'react'
import { useDeleteModalStore } from '@/store/delete.modal.store'
import { DeleteModalStore } from '@/types/modal'

const DeleteModalContext = createContext<DeleteModalStore | undefined>(undefined)

type DeleteModalContextProviderProps = {
    children: React.ReactNode
}

export function DeleteModalContextProvider({ children }: DeleteModalContextProviderProps) {
    const modalStore = useDeleteModalStore()

    return <DeleteModalContext.Provider value={modalStore}>{children}</DeleteModalContext.Provider>
}

export default DeleteModalContext
