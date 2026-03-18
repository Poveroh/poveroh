import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import type { Category, Subcategory } from '@/lib/api-client'
import Modal from '@/components/modal/modal'
import { CategoryForm } from '../form/category-form'
import { useCategory } from '@/hooks/use-category'
import { useModal } from '@/hooks/use-modal'
import { SubcategoryForm } from '../form/subcategory-form'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { FormRef } from '@/types'
import { CategoryData, SubcategoryData } from '@poveroh/types/contracts'

type CategorySubcategoryDialogProps = {
    mode: 'category' | 'subcategory'
}

export function CategorySubcategoryDialog({ mode }: CategorySubcategoryDialogProps) {
    const t = useTranslations()

    const { updateCategory, createCategory, deleteSubcategory, deleteCategory, createSubcategory, updateSubcategory } =
        useCategory()

    const modalId = mode === 'category' ? 'category-dialog' : 'subcategory-dialog'
    const modalManager = useModal<CategoryData | SubcategoryData>(modalId)
    const deleteModalManager = useDeleteModal<CategoryData | SubcategoryData>()

    const formRef = useRef<FormRef | null>(null)

    const handleFormSubmit = async (data: FormData | Partial<CategoryData | SubcategoryData>) => {
        modalManager.setLoading(true)

        const isSubcategory = mode === 'subcategory'
        const isEdit = modalManager.inEditingMode && modalManager.item

        const res = isSubcategory
            ? isEdit
                ? await updateSubcategory(modalManager.item!.id, data as Partial<SubcategoryData>)
                : await createSubcategory(data as Partial<SubcategoryData>)
            : isEdit
              ? await updateCategory(modalManager.item!.id, data as Partial<CategoryData>)
              : await createCategory(data as Partial<CategoryData>)

        const titleFromData =
            data instanceof FormData
                ? (data.get('title')?.toString() ?? '')
                : ((data as Partial<CategoryData | SubcategoryData> | undefined)?.title ?? '')

        if (!res) {
            modalManager.setLoading(false)
            return
        }

        if (isEdit || !modalManager.keepAdding.checked) {
            modalManager.closeModal()
        } else {
            formRef.current?.reset()
        }

        toast.success(
            t('messages.successfully', {
                a: modalManager.item?.title ?? titleFromData,
                b: t(isEdit ? 'messages.saved' : 'messages.uploaded')
            })
        )
        modalManager.setLoading(false)
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        const res =
            mode === 'category'
                ? await deleteCategory(deleteModalManager.item.id)
                : await deleteSubcategory(deleteModalManager.item.id)

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
            <Modal<CategoryData | SubcategoryData>
                modalId={modalId}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t(`${mode == 'category' ? 'categories.modal.newTitle' : 'subcategories.modal.newTitle'}`)
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
                    {mode == 'category' && (
                        <CategoryForm
                            ref={formRef}
                            initialData={modalManager.item as Category}
                            inEditingMode={modalManager.inEditingMode}
                            dataCallback={handleFormSubmit}
                        />
                    )}
                    {mode == 'subcategory' && (
                        <SubcategoryForm
                            ref={formRef}
                            initialData={modalManager.item as Subcategory}
                            inEditingMode={modalManager.inEditingMode}
                            dataCallback={handleFormSubmit}
                        />
                    )}
                </div>
            </Modal>

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
