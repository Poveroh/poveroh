import { ModalMode, ModalState } from '@/types/modal'
import { create } from 'zustand'

type RemoveFirstArg<F> = F extends (arg1: any, ...rest: infer R) => infer Ret ? (...args: R) => Ret : never

type BindModalId<T> = {
    [K in keyof T]: RemoveFirstArg<T[K]>
}

type ModalActionHandlers<T = unknown, Id = string> = {
    openModal: (modalId: Id, mode: ModalMode, item?: T, preConfig?: Partial<T>) => void
    closeModal: (modalId: Id) => void
    setItem: (modalId: Id, item?: T) => void
    setLoading: (modalId: Id, loading: boolean) => void
    setInEditingMode: (modalId: Id, editing: boolean) => void
    setKeepAddingVisibility: (modalId: Id, visibility?: boolean) => void
    setKeepAddingChecked: (modalId: Id, checked?: boolean) => void
    setButtonDisabled: (modalId: Id, disabled: boolean) => void
    setShowSaveButton: (modalId: Id, show: boolean) => void
    showStuff: () => void
}

export type ModalActions<T = unknown> = BindModalId<ModalActionHandlers<T, string>>

export type ModalStore<T = unknown> = ModalState<T> & ModalActions<T>

export type ModalStoreState = {
    modals: Record<string, ModalState>
} & ModalActionHandlers<unknown, string>

export const createDefaultModalState = <T = unknown>(): ModalState<T> => ({
    isOpen: false,
    item: undefined,
    preConfig: undefined,
    loading: false,
    inEditingMode: false,
    keepAdding: { visibility: false, checked: false },
    buttonDisabled: false,
    showSaveButton: true
})

const getModalState = (state: ModalStoreState, modalId: string) => state.modals[modalId] ?? createDefaultModalState()

export const bindModalStore = <T = unknown>(context: ModalStoreState, modalId: string): ModalStore<T> => {
    const modalState = context.modals[modalId] ?? createDefaultModalState<T>()

    return {
        ...modalState,
        openModal: (mode, item, preConfig) => context.openModal(modalId, mode, item, preConfig),
        closeModal: () => context.closeModal(modalId),
        setItem: item => context.setItem(modalId, item),
        setLoading: loading => context.setLoading(modalId, loading),
        setInEditingMode: editing => context.setInEditingMode(modalId, editing),
        setKeepAddingVisibility: visibility => context.setKeepAddingVisibility(modalId, visibility),
        setKeepAddingChecked: checked => context.setKeepAddingChecked(modalId, checked),
        setButtonDisabled: disabled => context.setButtonDisabled(modalId, disabled),
        setShowSaveButton: show => context.setShowSaveButton(modalId, show)
    } as ModalStore<T>
}

export const useModalStore = create<ModalStoreState>(set => ({
    modals: {},

    openModal: (modalId, mode, item, preConfig) =>
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: {
                    ...getModalState(state, modalId),
                    item,
                    preConfig,
                    inEditingMode: mode === 'edit',
                    keepAdding: { visibility: mode === 'create', checked: false },
                    isOpen: true
                }
            }
        })),

    closeModal: modalId =>
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: {
                    ...createDefaultModalState(),
                    isOpen: false
                }
            }
        })),
    setItem: (modalId, item) =>
        set(state => ({
            modals: { ...state.modals, [modalId]: { ...getModalState(state, modalId), item } }
        })),
    setLoading: (modalId, loading) =>
        set(state => ({
            modals: { ...state.modals, [modalId]: { ...getModalState(state, modalId), loading } }
        })),
    setInEditingMode: (modalId, editing) =>
        set(state => ({
            modals: { ...state.modals, [modalId]: { ...getModalState(state, modalId), inEditingMode: editing } }
        })),
    setKeepAddingVisibility: (modalId, visibility) =>
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: {
                    ...getModalState(state, modalId),
                    keepAdding: {
                        ...getModalState(state, modalId).keepAdding,
                        visibility: visibility ?? !getModalState(state, modalId).keepAdding.visibility
                    }
                }
            }
        })),
    setKeepAddingChecked: (modalId, checked) =>
        set(state => ({
            modals: {
                ...state.modals,
                [modalId]: {
                    ...getModalState(state, modalId),
                    keepAdding: {
                        ...getModalState(state, modalId).keepAdding,
                        checked: checked ?? !getModalState(state, modalId).keepAdding.checked
                    }
                }
            }
        })),
    setButtonDisabled: (modalId, disabled) =>
        set(state => ({
            modals: { ...state.modals, [modalId]: { ...getModalState(state, modalId), buttonDisabled: disabled } }
        })),
    setShowSaveButton: (modalId, show) =>
        set(state => ({
            modals: { ...state.modals, [modalId]: { ...getModalState(state, modalId), showSaveButton: show } }
        })),
    showStuff: () => {
        console.log('stuff')
    }
}))
