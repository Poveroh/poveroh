import DeleteModalContext from '@/context/DeleteModalContext'
import { DeleteModalStore } from '@/store/delete.modal.store'
import { useContext } from 'react'

export function useDeleteModal<T>() {
    const context = useContext(DeleteModalContext)

    if (!context) {
        throw new Error('useDeleteModal must be used within a DeleteModalContextProvider')
    }

    return context as DeleteModalStore<T>
}
