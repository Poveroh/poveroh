'use client'

import { Dialog, DialogContent } from '@poveroh/ui/components/dialog'
import { ModalFooter } from './modal-footer'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { cn } from '@poveroh/ui/lib/utils'
import { useEffect, useState } from 'react'
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
import { useTranslations } from 'next-intl'
import { useModal } from '@/hooks/use-modal'
import { ModalHeader } from './modal-header'
import { ModalProps } from '@/types/modal'

export default function Modal<T>(props: ModalProps) {
    const t = useTranslations()

    const { closeModal } = useModal<T>()

    const [showConfirmationDialog, setConfirmationDialog] = useState(props.askForConfirmation || false)
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)

    useEffect(() => {
        setConfirmationDialog(props.askForConfirmation || false)
    }, [props.askForConfirmation])

    const handleConfirmExit = () => {
        if (props.confirmationExit) {
            props.confirmationExit()
        }
        setConfirmationDialog(false)
    }

    const handleCancelExit = () => {
        setConfirmationDialog(false)
    }

    const handleOpenChange = () => {
        if (showConfirmationDialog) {
            setOpenConfirmationDialog(true)
        } else {
            closeModal()
        }
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && props.onClick) {
                props.onClick()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [props, props.onClick])

    return (
        <>
            <Dialog defaultOpen={true} open={props.open} onOpenChange={handleOpenChange}>
                <DialogContent className={cn('sm:max-w-[30vw] max-h-[90vh]', props.decoration?.dialogHeight)}>
                    <ModalHeader {...props} />
                    <div className={cn('flex flex-grow items-start overflow-y-auto', props.decoration?.contentHeight)}>
                        <SimpleBar className='w-full h-full'>{props.children}</SimpleBar>
                    </div>
                    {props.footer?.show && (props.footer.customFooter || <ModalFooter<T> {...props} />)}
                </DialogContent>
            </Dialog>

            {showConfirmationDialog && (
                <AlertDialog open={openConfirmationDialog} onOpenChange={setConfirmationDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('modal.confirmationDialog.title')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('modal.confirmationDialog.description')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCancelExit}>
                                {t('modal.confirmationDialog.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmExit} className='danger'>
                                {t('modal.confirmationDialog.confirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}
