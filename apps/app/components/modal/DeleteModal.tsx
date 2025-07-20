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
import { buttonVariants } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ModalProps = {
    title: string
    description?: string
    loading: boolean
    open: boolean
    closeDialog: () => void
    onConfirm: () => void
}

export function DeleteModal({ title, description, open, closeDialog, loading, onConfirm }: ModalProps) {
    const t = useTranslations()

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('modal.delete.title', {
                            a: title
                        })}
                    </AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => closeDialog()}>
                        {t('buttons.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: 'danger' })}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 className='animate-spin mr-2' />}
                        {t('buttons.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
