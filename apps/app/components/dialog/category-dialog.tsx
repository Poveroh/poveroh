import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { CategoryForm } from '../form/category-form'
import { useCategory } from '@/hooks/use-category'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { FormRef } from '@/types'
import { CategoryData, CreateCategoryRequest, CreateUpdateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types'
import { useError } from '@/hooks/use-error'
import { MODAL_IDS } from '@/types/constant'

export function CategoryDialog() {
    const t = useTranslations()
    const { createCategoryMutation, updateCategoryMutation } = useCategory()
    const { handleError } = useError()

    const modalManager = useModal<CategoryData>(MODAL_IDS.CATEGORY)
    const { openModal: openDeleteModal } = useDeleteModal<CategoryData>()

    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateCategoryRequest) => {
        const response = await createCategoryMutation.mutateAsync({
            body: payload
        })

        if (!response?.success) {
            modalManager.setLoading(false)
            return
        }

        if (modalManager.keepAdding.checked) {
            formRef.current?.reset()
        } else {
            modalManager.closeModal()
        }

        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateCategoryRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateCategoryMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateCategoryRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateCategoryRequest)
            } else {
                await onCreate(payload as CreateCategoryRequest)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<CategoryData>
            modalId={MODAL_IDS.CATEGORY}
            open={modalManager.isOpen}
            title={
                modalManager.inEditingMode && modalManager.item
                    ? modalManager.item.title
                    : t('categories.modal.newTitle')
            }
            footer={{
                show: true
            }}
            onClick={() => formRef.current?.submit()}
            onDeleteClick={() => {
                openDeleteModal(modalManager.item)
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
    )
}
