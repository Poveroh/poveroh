'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@poveroh/ui/components/dialog'
import DynamicIcon from '../icon/dynamicIcon'
import { BrandIcon } from '../icon/brandIcon'
import { ModalFooter, ModalFooterProps } from './formFooter'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'
import { cn } from '@poveroh/ui/lib/utils'

type ModalProps = {
    open: boolean
    title: string
    description?: string
    icon?: string
    iconMode?: 'icon' | 'img'
    children: React.ReactNode
    dialogHeight?: string
    handleOpenChange: (open: boolean) => void
} & ModalFooterProps

export function Modal(props: ModalProps) {
    return (
        <Dialog defaultOpen={true} open={props.open} onOpenChange={props.handleOpenChange}>
            <DialogContent className='sm:max-w-[40vw] max-h-[90vh]'>
                <DialogHeader>
                    <div className={cn('flex flex-row items-center space-x-3', props.dialogHeight)}>
                        {props.icon &&
                            (props.iconMode === 'img' ? (
                                <BrandIcon icon={`url(${props.icon})`} size='xl'></BrandIcon>
                            ) : (
                                <DynamicIcon key={props.icon} name={props.icon} />
                            ))}
                        <div className='flex flex-col space-y-1'>
                            <DialogTitle>{props.title}</DialogTitle>
                            {props.description && <DialogDescription>{props.description}</DialogDescription>}
                        </div>
                    </div>
                </DialogHeader>
                <div className='flex flex-grow overflow-y-auto'>
                    <PerfectScrollbar className='w-full' option={{ suppressScrollX: true }}>
                        {props.children}
                    </PerfectScrollbar>
                </div>
                <ModalFooter
                    loading={props.loading}
                    inEditingMode={props.inEditingMode}
                    keepAdding={props.keepAdding}
                    setKeepAdding={props.setKeepAdding}
                    onClick={props.onClick}
                />
            </DialogContent>
        </Dialog>
    )
}
