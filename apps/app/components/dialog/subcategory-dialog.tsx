import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { SubcategoryForm } from '../form/subcategory-form'
import { useSubcategory } from '@/hooks/use-subcategory'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { FormRef } from '@/types'
import {
    CreateSubcategoryRequest,
    CreateUpdateSubcategoryRequest,
    SubcategoryData,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { useError } from '@/hooks/use-error'
import { MODAL_IDS } from '@/types/constant'

export function SubcategoryDialog() {
    const t = useTranslations()
    const { createSubcategoryMutation, updateSubcategoryMutation } = useSubcategory()
    const { handleError } = useError()

    const modalManager = useModal<SubcategoryData>(MODAL_IDS.SUBCATEGORY)
    const { openModal: openDeleteModal } = useDeleteModal<SubcategoryData>()

    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateSubcategoryRequest) => {
        const response = await createSubcategoryMutation.mutateAsync({
            body: payload as CreateSubcategoryRequest
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

    const onUpdate = async (payload: UpdateSubcategoryRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateSubcategoryMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateSubcategoryRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateSubcategoryRequest)
            } else {
                await onCreate(payload as CreateSubcategoryRequest)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<SubcategoryData>
            modalId={MODAL_IDS.SUBCATEGORY}
            open={modalManager.isOpen}
            title={
                modalManager.inEditingMode && modalManager.item
                    ? modalManager.item.title
                    : t('subcategories.modal.newTitle')
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
                <SubcategoryForm
                    ref={formRef}
                    initialData={modalManager.item ?? null}
                    inEditingMode={modalManager.inEditingMode}
                    dataCallback={handleFormSubmit}
                />
            </div>
        </Modal>
    )
}
