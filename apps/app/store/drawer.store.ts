import { create } from 'zustand'

export interface DrawerState<T = unknown> {
    isOpen: boolean
    item?: T
    loading: boolean
    inEditingMode: boolean
    keepAdding: { visibility: boolean; checked: boolean }
    buttonDisabled: boolean
    showSaveButton: boolean
}

export interface DrawerActions<T = unknown> {
    openDrawer: (mode: 'edit' | 'create', item?: T) => void
    closeDrawer: () => void
    setItem: (item?: T) => void
    setLoading: (loading: boolean) => void
    setInEditingMode: (editing: boolean) => void
    setKeepAddingVisibility: (visibility?: boolean) => void
    setKeepAddingChecked: (checked?: boolean) => void
    setButtonDisabled: (disabled: boolean) => void
    setShowSaveButton: (show: boolean) => void
}

export type DrawerStore<T = unknown> = DrawerState<T> & DrawerActions<T>

export const useDrawerStore = create<DrawerStore>(set => ({
    isOpen: false,
    item: undefined,
    loading: false,
    inEditingMode: false,
    keepAdding: { visibility: false, checked: false },
    buttonDisabled: false,
    showSaveButton: true,

    openDrawer: (mode, item) =>
        set(() => ({
            item,
            inEditingMode: mode === 'edit',
            keepAdding: { visibility: mode === 'create', checked: false },
            isOpen: true
        })),

    closeDrawer: () =>
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
