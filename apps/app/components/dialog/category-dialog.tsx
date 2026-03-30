import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { CategoryForm } from '../form/category-form'
import { useCategory } from '@/hooks/use-category'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { FormRef } from '@/types'
import { CategoryData, UpdateCategoryRequest } from '@poveroh/types'

export function CategoryDialog() {
    const t = useTranslations()
    const { createCategoryMutation, updateCategoryMutation, deleteCategoryMutation } = useCategory()

    const modalId = 'category-dialog'
    const modalManager = useModal<CategoryData>(modalId)
    const deleteModalManager = useDeleteModal<CategoryData>()

    const formRef = useRef<FormRef | null>(null)

    const handleFormSubmit = async (data: FormData | Partial<CategoryData>) => {
        modalManager.setLoading(true)

        const res = modalManager.inEditingMode && modalManager.item
        await updateCategoryMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: data as UpdateCategoryRequest
        })
        // : await createCategoryMutation.mutateAsync({
        //       body: data as UpdateCategoryRequest
        //   })

        const titleFromData =
            data instanceof FormData
                ? (data.get('title')?.toString() ?? '')
                : ((data as Partial<CategoryData> | undefined)?.title ?? '')

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

        const res = await deleteCategoryMutation.mutateAsync({
            path: { id: deleteModalManager.item.id }
        })

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
            <Modal<CategoryData>
                modalId={modalId}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('categories.modal.newTitle')
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
                    <CategoryForm
                        ref={formRef}
                        initialData={modalManager.item ?? null}
                        inEditingMode={modalManager.inEditingMode}
                        dataCallback={handleFormSubmit}
                    />
                </div>
            </Modal>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('categories.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
