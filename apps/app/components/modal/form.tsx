'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@poveroh/ui/components/dialog'

type ModalProps = {
    open: boolean
    title: string
    description?: string
    icon?: string
    children: React.ReactNode
    handleOpenChange: (open: boolean) => void
}

export function Modal({ children, open, title, description, icon, handleOpenChange }: ModalProps) {
    return (
        <Dialog defaultOpen={true} open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-[40vw]'>
                <DialogHeader>
                    <div className='flex flex-row items-center space-x-3'>
                        {icon && <div className='brands big' style={{ backgroundImage: `url(${icon})` }}></div>}
                        <div className='flex flex-col space-y-1'>
                            <DialogTitle>{title}</DialogTitle>
                            {description && <DialogDescription>{description}</DialogDescription>}
                        </div>
                    </div>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}
