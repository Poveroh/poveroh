import DeleteModalContext from '@/context/delete-modal-context'
import { DeleteModalStore } from '@/types/modal'
import { useContext } from 'react'

export function useDeleteModal<T>() {
    const context = useContext(DeleteModalContext)

    if (!context) {
        throw new Error('useDeleteModal must be used within a DeleteModalContextProvider')
    }

    return context as DeleteModalStore<T>
}
