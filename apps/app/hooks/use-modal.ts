import ModalContext from '@/context/modal-context'
import { bindModalStore, ModalStore } from '@/store/modal.store'
import { useContext } from 'react'

export function useModal<T>(modalId: string = 'default') {
    const context = useContext(ModalContext)

    if (!context) {
        throw new Error('useModalContext must be used within a ModalContextProvider')
    }

    return bindModalStore<T>(context, modalId) as ModalStore<T>
}
