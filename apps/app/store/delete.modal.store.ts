import { create } from 'zustand'
import { DeleteModalStore } from '@/types/modal'

export const useDeleteModalStore = create<DeleteModalStore>(set => ({
    isOpen: false,
    item: undefined,
    loading: false,
    openModal: item =>
        set(() => ({
            item,
            isOpen: true
        })),

    closeModal: () =>
        set(() => ({
            item: undefined,
            loading: false,
            isOpen: false
        })),
    setItem: item => set(() => ({ item })),
    setLoading: loading => set(() => ({ loading }))
}))
