'use client'

import { Dialog, DialogOverlay, DialogContent } from '@poveroh/ui/components/dialog'
import { useRouter } from 'next/navigation'

export function ModalUrl({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const handleOpenChange = () => {
        router.back()
    }

    return (
        <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
            <DialogOverlay>
                <DialogContent className='overflow-y-hidden'>{children}</DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}
