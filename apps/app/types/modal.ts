import { AppearanceMode } from '@poveroh/types'

export type ModalBaseProps = {
    open: boolean
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
    footer: {
        show: boolean
        customFooter?: React.ReactElement
    }
    confirmButtonText?: string
    onCancel?: () => void
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
} & ModalFooterProps &
    ModalHeaderProps &
    ModalBaseProps
