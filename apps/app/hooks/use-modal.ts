import ModalContext from '@/context/modal-context'
import { ModalStore } from '@/store/modal.store'
import { useContext } from 'react'

export function useModal<T>() {
    const context = useContext(ModalContext)

    if (!context) {
        throw new Error('useModalContext must be used within a ModalContextProvider')
    }

    return context as ModalStore<T>
}
