import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { IImport } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { UploadForm } from '../form/transactions/upload-form'
import { useImport } from '@/hooks/use-imports'
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

export function ImportDrawer() {
    const t = useTranslations()

    const { completeImport, removeImport, importStore } = useImport()

    const drawerManager = useDrawer<IImport>()
    const deleteModalManager = useDeleteModal<IImport>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [localImports, setLocalImports] = useState<IImport | undefined>(drawerManager.item)

    const handleFormSubmit = async (data: IImport) => {
        drawerManager.setLoading(true)

        const res: IImport | null = await completeImport(data.id)

        if (!res) {
            drawerManager.setLoading(false)
            return
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
                b: t(drawerManager.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLocalImports(res)

        drawerManager.setLoading(false)

        drawerManager.closeDrawer()
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        const res = await removeImport(deleteModalManager.item.id)

        deleteModalManager.setLoading(false)

        if (res) {
            deleteModalManager.closeModal()

            if (drawerManager.item && drawerManager.item.id === deleteModalManager.item.id) {
                drawerManager.closeDrawer()
            }
        }
    }

    return (
        <>
            <Drawer open={drawerManager.isOpen} onOpenChange={drawerManager.closeDrawer}>
                <DrawerContent className='flex flex-col'>
                    <div
                        className={cn(
                            'mx-auto flex flex-col pb-4',
                            importStore.pendingTransactions.length > 0 && 'h-full',
                            importStore.pendingTransactions.length == 0 ? 'w-[448px]' : 'w-1/2'
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
                            <UploadForm
                                ref={formRef}
                                initialData={localImports}
                                dataCallback={handleFormSubmit}
                                showSaveButton={() => {}}
                            ></UploadForm>
                        </div>
                        <DrawerFooter className='flex-shrink-0'>
                            <DrawerClose asChild>
                                <Button
                                    className='w-fit'
                                    variant='outline'
                                    onClick={() => {
                                        importStore.cleanCurrentImports()
                                        drawerManager.closeDrawer()
                                    }}
                                >
                                    {t('buttons.cancel')}
                                </Button>
                            </DrawerClose>
                            <Button
                                className='w-full'
                                onClick={() => {
                                    if (importStore.pendingTransactions.length === 0) {
                                        formRef.current?.submit()
                                    } else {
                                        handleFormSubmit(importStore.currentImport!)
                                    }
                                }}
                            >
                                {t('buttons.submit')}
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('accounts.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
