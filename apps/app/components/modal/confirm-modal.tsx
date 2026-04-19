'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@poveroh/ui/components/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ModalProps = {
    title: string
    description?: string
    loading: boolean
    open: boolean
    buttonConfirmLabel?: string
    closeDialog: () => void
    onConfirm: () => void
}

export function ConfirmModal({
    title,
    description,
    open,
    loading,
    buttonConfirmLabel,
    closeDialog,
    onConfirm
}: ModalProps) {
    const t = useTranslations()

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription dangerouslySetInnerHTML={{ __html: description }} />}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => closeDialog()}>
                        {t('buttons.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={loading}>
                        {loading && <Loader2 className='animate-spin mr-2' />}
                        {buttonConfirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
