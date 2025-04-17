'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@poveroh/ui/components/dialog'
import DynamicIcon from '../icon/dynamicIcon'
import { BrandIcon } from '../icon/brandIcon'

type ModalProps = {
    open: boolean
    title: string
    description?: string
    icon?: string
    iconMode?: 'icon' | 'img'
    children: React.ReactNode
    handleOpenChange: (open: boolean) => void
}

export function Modal({ children, open, title, description, icon, iconMode, handleOpenChange }: ModalProps) {
    return (
        <Dialog defaultOpen={true} open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-[40vw] h-[80vh]'>
                <DialogHeader>
                    <div className='flex flex-row items-center space-x-3'>
                        {icon &&
                            (iconMode === 'img' ? (
                                <BrandIcon icon={`url(${icon})`} size='xl'></BrandIcon>
                            ) : (
                                <DynamicIcon key={icon} name={icon} />
                            ))}
                        <div className='flex flex-col space-y-1'>
                            <DialogTitle>{title}</DialogTitle>
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </div>
                    </div>
                </DialogHeader>
                <div className='flex flex-grow w-full overflow-y-auto'>{children}</div>
            </DialogContent>
        </Dialog>
    )
}
