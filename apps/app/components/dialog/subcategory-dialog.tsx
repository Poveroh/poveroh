import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { SubcategoryForm } from '../form/subcategory-form'
import { useSubcategory } from '@/hooks/use-subcategory'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { FormRef } from '@/types'
import { SubcategoryData } from '@poveroh/types'
import type { Subcategory } from '@/lib/api-client'

export function SubcategoryDialog() {
    const t = useTranslations()
    const { createSubcategoryMutation, updateSubcategoryMutation, deleteSubcategoryMutation } = useSubcategory()

    const modalId = 'subcategory-dialog'
    const modalManager = useModal<SubcategoryData>(modalId)
    const deleteModalManager = useDeleteModal<SubcategoryData>()

    const formRef = useRef<FormRef | null>(null)

    const handleFormSubmit = async (data: FormData | Partial<SubcategoryData>) => {
        modalManager.setLoading(true)

        const res = await updateSubcategoryMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: data as Partial<Subcategory>
        })

        const titleFromData =
            data instanceof FormData
                ? (data.get('title')?.toString() ?? '')
                : ((data as Partial<SubcategoryData> | undefined)?.title ?? '')

        if (!res) {
            modalManager.setLoading(false)
            return
        }

        if (modalManager.inEditingMode || !modalManager.keepAdding.checked) {
            modalManager.closeModal()
        } else {
            formRef.current?.reset()
        }

        toast.success(
            t('messages.successfully', {
                a: modalManager.item?.title ?? titleFromData,
                b: t(modalManager.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )
        modalManager.setLoading(false)
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        const res = await deleteSubcategory(deleteModalManager.item.id)

        deleteModalManager.setLoading(false)

        if (res) {
            deleteModalManager.closeModal()

            if (modalManager.item && modalManager.item.id === deleteModalManager.item.id) {
                modalManager.closeModal()
            }
        }
    }

    return (
        <>
            <Modal<SubcategoryData>
                modalId={modalId}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('subcategories.modal.newTitle')
                }
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.logoIcon ?? '',
                        mode: 'LOGO',
                        circled: true
                    }
                }}
                footer={{
                    show: true
                }}
                onClick={() => formRef.current?.submit()}
                onDeleteClick={() => {
                    deleteModalManager.openModal(modalManager.item)
                }}
            >
                <div className='flex flex-col space-y-6 w-full'>
                    <SubcategoryForm
                        ref={formRef}
                        initialData={modalManager.item ?? null}
                        inEditingMode={modalManager.inEditingMode}
                        dataCallback={handleFormSubmit}
                    />
                </div>
            </Modal>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('subcategories.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
