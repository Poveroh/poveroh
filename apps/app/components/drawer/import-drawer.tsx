import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { toast } from '@poveroh/ui/components/sonner'
import { ImportForm } from '../form/transactions/import-form'
import { useImport } from '@/hooks/use-imports'
import { useImportTransactions } from '@/hooks/use-import-transactions'
import { Button } from '@poveroh/ui/components/button'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
    DrawerClose
} from '@poveroh/ui/components/drawer'
import { useDrawer } from '@/hooks/use-drawer'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { cn } from '@poveroh/ui/lib/utils'
import { CreateImportRequest, ImportData } from '@poveroh/types'
import { useError } from '@/hooks/use-error'

export function ImportDrawer() {
    const t = useTranslations()

    const { handleError } = useError()
    const { completeImport, deleteImport, createImport } = useImport()

    const drawerManager = useDrawer<ImportData>()
    const deleteModalManager = useDeleteModal<ImportData>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const currentImport = drawerManager.item
    const currentImportId = currentImport?.id

    const { transactions: pendingTransactions } = useImportTransactions(currentImportId)

    const handleFormSubmit = async (payload: CreateImportRequest, files: File[]) => {
        if (drawerManager.loading) return

        try {
            drawerManager.setLoading(true)

            if (!files || files.length === 0) return

            const response = await createImport.mutateAsync({
                body: {
                    data: payload,
                    file: files
                }
            })

            const created = response?.data as ImportData | undefined

            drawerManager.setItem(created)
        } catch (error) {
            handleError(error)
        } finally {
            drawerManager.setLoading(false)
        }
    }

    const handleCompleteImport = async () => {
        if (!currentImport) return

        drawerManager.setLoading(true)

        try {
            await completeImport.mutateAsync({ path: { id: currentImport.id } })

            toast.success(
                t('messages.successfully', {
                    a: currentImport.title,
                    b: t(drawerManager.inEditingMode ? 'messages.saved' : 'messages.uploaded')
                })
            )

            drawerManager.closeDrawer()
        } finally {
            drawerManager.setLoading(false)
        }
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        try {
            await deleteImport.mutateAsync({ path: { id: deleteModalManager.item.id } })

            deleteModalManager.closeModal()

            if (drawerManager.item && drawerManager.item.id === deleteModalManager.item.id) {
                drawerManager.closeDrawer()
            }
        } finally {
            deleteModalManager.setLoading(false)
        }
    }

    const handleSubmit = () => {
        if (pendingTransactions.length === 0) {
            formRef.current?.submit()
        } else {
            handleCompleteImport()
        }
    }

    return (
        <>
            <Drawer open={drawerManager.isOpen} onOpenChange={drawerManager.closeDrawer}>
                <DrawerContent className='flex flex-col'>
                    <div
                        className={cn(
                            'mx-auto flex flex-col pb-4',
                            pendingTransactions.length > 0 && 'h-full',
                            pendingTransactions.length === 0 ? 'w-[448px]' : 'w-1/2'
                        )}
                    >
                        <DrawerHeader className='flex-shrink-0'>
                            <DrawerTitle>
                                {t(`imports.modal.${drawerManager.inEditingMode ? 'editTitle' : 'uploadTitle'}`)}
                            </DrawerTitle>
                            <DrawerDescription className='m-auto w-[448px]'>
                                {t('imports.modal.description')}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className='flex-1 overflow-auto'>
                            <ImportForm
                                ref={formRef}
                                inEditingMode={false}
                                initialData={null}
                                dataCallback={handleFormSubmit}
                            />
                        </div>
                        <DrawerFooter className='flex-shrink-0'>
                            <DrawerClose asChild>
                                <Button className='w-fit' variant='outline' onClick={() => drawerManager.closeDrawer()}>
                                    {t('buttons.cancel')}
                                </Button>
                            </DrawerClose>
                            <Button className='w-full' onClick={handleSubmit}>
                                {t('buttons.submit')}
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('imports.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
