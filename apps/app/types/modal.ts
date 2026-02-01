import { AppearanceMode } from '@poveroh/types'

export type ModalBaseProps = {
    open: boolean
    onOpenChange?: (open: boolean) => void
}

export type DecorationProps = {
    dialogHeight?: string
    contentHeight?: string
    iconLogo: {
        name: string
        mode: AppearanceMode
        circled?: boolean
    }
}

export type ModalFooterProps = {
    modalId?: string
    footer: {
        show: boolean
        customFooter?: React.ReactElement
    }
    confirmButtonText?: string
    onClick: () => void
    onDeleteClick?: () => void
}

export type ModalHeaderProps = {
    title: string
    description?: string
    decoration?: DecorationProps
}

export type ModalProps = {
    children: React.ReactNode
    askForConfirmation?: boolean
    confirmationExit?: () => void
    modalId?: string
} & ModalFooterProps &
    ModalHeaderProps &
    ModalBaseProps

export type DeleteModalState<T = unknown> = {
    isOpen: boolean
    item?: T
    loading: boolean
}

export type DeleteModalActions<T = unknown> = {
    openModal: (item?: T) => void
    closeModal: () => void
    setItem: (item?: T) => void
    setLoading: (loading: boolean) => void
}

export type DeleteModalStore<T = unknown> = DeleteModalState<T> & DeleteModalActions<T>

export type ModalState<T = unknown> = {
    isOpen: boolean
    item?: T
    preConfig?: Partial<T>
    loading: boolean
    inEditingMode: boolean
    keepAdding: { visibility: boolean; checked: boolean }
    buttonDisabled: boolean
    showSaveButton: boolean
}

export type ModalMode = 'edit' | 'create'
