export type DrawerState<T = unknown> = {
    isOpen: boolean
    item?: T
    loading: boolean
    inEditingMode: boolean
    keepAdding: { visibility: boolean; checked: boolean }
    buttonDisabled: boolean
    showSaveButton: boolean
}

export type DrawerActions<T = unknown> = {
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
