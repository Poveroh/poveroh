'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@poveroh/ui/components/dialog'
import DynamicIcon from '../icon/DynamicIcon'
import { BrandIcon } from '../icon/BrandIcon'
import { ModalFooter, ModalFooterProps } from './FormFooter'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { cn } from '@poveroh/ui/lib/utils'
import { ReactElement, use, useEffect, useState } from 'react'
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
    icon?: string
    iconMode?: AppearanceMode
    iconCircled?: boolean
    children: React.ReactNode
    showFooter?: boolean
    customFooter?: ReactElement
    dialogHeight?: string
    contentHeight?: string
    askForConfirmation?: boolean
    confirmationExit?: () => void
    handleOpenChange: (open: boolean) => void
} & ModalFooterProps

export function Modal({ showFooter = true, ...props }: ModalProps) {
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

    return (
        <>
            <Dialog defaultOpen={true} open={props.open} onOpenChange={handleOpenChange}>
                <DialogContent className={cn('sm:max-w-[40vw] max-h-[90vh]', props.dialogHeight)}>
                    <DialogHeader>
                        <div className='flex flex-row items-center space-x-3'>
                            {props.icon &&
                                (props.iconMode === AppearanceMode.LOGO ? (
                                    <BrandIcon circled={props.iconCircled} icon={props.icon} size='xl'></BrandIcon>
                                ) : (
                                    <DynamicIcon key={props.icon} name={props.icon} />
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
                            hideKeepAdding={props.hideKeepAdding}
                            buttonDisabled={props.buttonDisabled}
                            showSaveButton={props.showSaveButton}
                            setKeepAdding={props.setKeepAdding}
                            onClick={props.onClick}
                        />
                    )}
                    {props.customFooter}
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
