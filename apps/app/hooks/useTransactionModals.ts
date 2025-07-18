import { useState, useCallback } from 'react'
import { ITransaction } from '@poveroh/types'

export const useTransactionModals = () => {
    const [itemToDelete, setItemToDelete] = useState<ITransaction | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ITransaction | null>(null)
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const openDeleteModal = useCallback((transaction: ITransaction) => {
        setItemToDelete(transaction)
    }, [])

    const closeDeleteModal = useCallback(() => {
        setItemToDelete(null)
        setIsDeleteLoading(false)
    }, [])

    const openEditModal = useCallback((transaction: ITransaction) => {
        setItemToEdit(transaction)
    }, [])

    const closeEditModal = useCallback(() => {
        setItemToEdit(null)
    }, [])

    const openNewDialog = useCallback(() => {
        setIsNewDialogOpen(true)
    }, [])

    const closeNewDialog = useCallback(() => {
        setIsNewDialogOpen(false)
    }, [])

    const openUploadDialog = useCallback(() => {
        setIsUploadDialogOpen(true)
    }, [])

    const closeUploadDialog = useCallback(() => {
        setIsUploadDialogOpen(false)
    }, [])

    const handleDelete = useCallback(
        async (deleteFunction: (id: string) => Promise<boolean>) => {
            if (!itemToDelete) return

            setIsDeleteLoading(true)

            try {
                const success = await deleteFunction(itemToDelete.id)
                if (success) {
                    closeDeleteModal()
                }
            } catch (error) {
                console.error('Error deleting transaction:', error)
            } finally {
                setIsDeleteLoading(false)
            }
        },
        [itemToDelete, closeDeleteModal]
    )

    return {
        // State
        itemToDelete,
        itemToEdit,
        isNewDialogOpen,
        isUploadDialogOpen,
        isDeleteLoading,

        // Actions
        openDeleteModal,
        closeDeleteModal,
        openEditModal,
        closeEditModal,
        openNewDialog,
        closeNewDialog,
        openUploadDialog,
        closeUploadDialog,
        handleDelete
    }
}
