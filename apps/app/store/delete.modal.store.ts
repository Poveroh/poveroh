import { create } from 'zustand'

export interface DeleteModalState<T = unknown> {
    isOpen: boolean
    item?: T
    loading: boolean
}

export interface DeleteModalActions<T = unknown> {
    openModal: (item?: T) => void
    closeModal: () => void
    setItem: (item?: T) => void
    setLoading: (loading: boolean) => void
}

export type DeleteModalStore<T = unknown> = DeleteModalState<T> & DeleteModalActions<T>

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
