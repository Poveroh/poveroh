import { create } from 'zustand'

export interface ModalState<T = unknown> {
    isOpen: boolean
    item?: T
    loading: boolean
    inEditingMode: boolean
    keepAdding: { visibility: boolean; checked: boolean }
    buttonDisabled: boolean
    showSaveButton: boolean
}

export interface ModalActions<T = unknown> {
    openModal: (mode: 'edit' | 'create', item?: T) => void
    closeModal: () => void
    setItem: (item?: T) => void
    setLoading: (loading: boolean) => void
    setInEditingMode: (editing: boolean) => void
    setKeepAddingVisibility: (visibility?: boolean) => void
    setKeepAddingChecked: (checked?: boolean) => void
    setButtonDisabled: (disabled: boolean) => void
    setShowSaveButton: (show: boolean) => void
}

export type ModalStore<T = unknown> = ModalState<T> & ModalActions<T>

export const useModalStore = create<ModalStore>(set => ({
    isOpen: false,
    item: undefined,
    loading: false,
    inEditingMode: false,
    keepAdding: { visibility: false, checked: false },
    buttonDisabled: false,
    showSaveButton: true,

    openModal: (mode, item) =>
        set(() => ({
            item,
            inEditingMode: mode === 'edit',
            keepAdding: { visibility: mode === 'create', checked: false },
            isOpen: true
        })),

    closeModal: () =>
        set(() => ({
            item: undefined,
            loading: false,
            inEditingMode: false,
            keepAdding: { visibility: false, checked: false },
            buttonDisabled: false,
            showSaveButton: true,
            isOpen: false
        })),
    setItem: item => set(() => ({ item })),
    setLoading: loading => set(() => ({ loading })),
    setInEditingMode: editing => set(() => ({ inEditingMode: editing })),
    setKeepAddingVisibility: visibility =>
        set(state => ({
            keepAdding: { ...state.keepAdding, visibility: visibility ?? !state.keepAdding.visibility }
        })),
    setKeepAddingChecked: checked =>
        set(state => ({ keepAdding: { ...state.keepAdding, checked: checked ?? !state.keepAdding.checked } })),
    setButtonDisabled: disabled => set(() => ({ buttonDisabled: disabled })),
    setShowSaveButton: show => set(() => ({ showSaveButton: show }))
}))
