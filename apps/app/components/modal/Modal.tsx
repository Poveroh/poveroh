'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@poveroh/ui/components/dialog'
import DynamicIcon from '../icon/DynamicIcon'
import { BrandIcon } from '../icon/BrandIcon'
import { ModalFooter, ModalFooterProps } from './FormFooter'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { cn } from '@poveroh/ui/lib/utils'
import { useEffect, useState } from 'react'
import { AppearanceMode } from '@poveroh/types'
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

type ModalProps = {
    open: boolean
    title: string
    description?: string
    icon?: {
        icon?: string
        iconMode?: AppearanceMode
        iconCircled?: boolean
    }
    children: React.ReactNode
    footer?: {
        show?: boolean
        elements?: React.ReactNode
    }
    dialogHeight?: string
    contentHeight?: string
    askForConfirmation?: boolean
    confirmationExit?: () => void
    handleOpenChange: (open: boolean) => void
} & ModalFooterProps

export function Modal({ footer = {}, ...props }: ModalProps) {
    const t = useTranslations()

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

    const handleOpenChange = (open: boolean) => {
        if (showConfirmationDialog) {
            setOpenConfirmationDialog(true)
        } else {
            props.handleOpenChange(open)
        }
    }

    const showFooter = footer.show !== undefined ? footer.show : true

    return (
        <>
            <Dialog defaultOpen={true} open={props.open} onOpenChange={handleOpenChange}>
                <DialogContent className={cn('sm:max-w-[40vw] max-h-[90vh]', props.dialogHeight)}>
                    <DialogHeader>
                        <div className='flex flex-row items-center space-x-3'>
                            {props.icon &&
                                (props.icon.iconMode === AppearanceMode.LOGO ? (
                                    props.icon.icon ? (
                                        <BrandIcon
                                            circled={props.icon.iconCircled}
                                            icon={props.icon.icon}
                                            size='xl'
                                        ></BrandIcon>
                                    ) : null
                                ) : (
                                    <DynamicIcon key={props.icon.icon ?? ''} name={props.icon.icon ?? ''} />
                                ))}
                            <div className='flex flex-col space-y-1'>
                                <DialogTitle>{props.title}</DialogTitle>
                                {props.description && <DialogDescription>{props.description}</DialogDescription>}
                            </div>
                        </div>
                    </DialogHeader>
                    <div className={cn('flex flex-grow items-start overflow-y-auto', props.contentHeight)}>
                        <SimpleBar className='w-full h-full'>{props.children}</SimpleBar>
                    </div>
                    {showFooter && (
                        <ModalFooter
                            loading={props.loading}
                            inEditingMode={props.inEditingMode}
                            keepAdding={props.keepAdding}
                            buttonDisabled={props.buttonDisabled}
                            showSaveButton={props.showSaveButton}
                            confirmButtonText={props.confirmButtonText}
                            onClick={props.onClick}
                        />
                    )}
                    {footer?.elements}
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
