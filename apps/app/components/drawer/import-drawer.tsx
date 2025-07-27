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

export function ImportDrawer() {
    const t = useTranslations()

    const { completeImport, removeImport } = useImport()

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
                <DrawerContent>
                    <div className='mx-auto  w-[448px] pt-10'>
                        <DrawerHeader>
                            <DrawerTitle>
                                {t(`imports.modal.${drawerManager.inEditingMode ? 'editTitle' : 'uploadTitle'}`)}
                            </DrawerTitle>
                            <DrawerDescription className='w-3/4 m-auto'>
                                {t('imports.modal.fileDescription')}
                            </DrawerDescription>
                        </DrawerHeader>
                        <UploadForm
                            ref={formRef}
                            initialData={localImports}
                            dataCallback={handleFormSubmit}
                            showSaveButton={() => {}}
                            closeDialog={drawerManager.closeDrawer}
                        ></UploadForm>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button className='w-fit' variant='outline'>
                                    Cancel
                                </Button>
                            </DrawerClose>
                            <Button className='w-full'>Submit</Button>
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
