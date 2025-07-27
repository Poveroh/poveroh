import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { AppearanceMode, CategoryModelMode, ICategory, ISubcategory } from '@poveroh/types'
import Modal from '@/components/modal/modal'
import { CategoryForm } from '../form/category-form'
import { useCategory } from '@/hooks/use-category'
import { useModal } from '@/hooks/use-modal'
import { SubcategoryForm } from '../form/subcategory-form'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'

type CategorySubcategoryDialogProps = {
    mode: CategoryModelMode
}

export function CategorySubcategoryDialog({ mode }: CategorySubcategoryDialogProps) {
    const t = useTranslations()

    const { editCategory, addCategory, removeSubcategory, removeCategory, addSubcategory, editSubcategory } =
        useCategory()

    const modalManager = useModal<ICategory | ISubcategory>()
    const deleteModalManager = useDeleteModal<ICategory | ISubcategory>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData) => {
        modalManager.setLoading(true)
        let res: ICategory | ISubcategory | null = null

        const isSubcategory = mode === 'subcategory'
        const isEdit = modalManager.inEditingMode && modalManager.item

        if (isSubcategory) {
            res = isEdit ? await editSubcategory(modalManager.item!.id, data) : await addSubcategory(data)
        } else {
            res = isEdit ? await editCategory(modalManager.item!.id, data) : await addCategory(data)
        }

        if (!res) {
            modalManager.setLoading(false)
            return
        }

        if (isEdit || !modalManager.keepAdding) {
            modalManager.closeModal()
        } else {
            formRef.current?.reset()
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
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
                ? await removeCategory(deleteModalManager.item.id)
                : await removeSubcategory(deleteModalManager.item.id)

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
            <Modal<ICategory | ISubcategory>
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t(`${mode ? 'categories.modal.newTitle' : 'subcategories.modal.newTitle'}`)
                }
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.logoIcon ?? '',
                        mode: AppearanceMode.ICON,
                        circled: true
                    }
                }}
                footer={{
                    show: true
                }}
                onClick={() => formRef.current?.submit()}
                onCancel={() => modalManager.closeModal()}
                onDeleteClick={() => {
                    deleteModalManager.openModal(modalManager.item)
                }}
            >
                <div className='flex flex-col space-y-6 w-full'>
                    {mode == 'category' && (
                        <CategoryForm
                            ref={formRef}
                            initialData={modalManager.item as ICategory}
                            inEditingMode={modalManager.inEditingMode}
                            dataCallback={handleFormSubmit}
                            closeDialog={modalManager.closeModal}
                        />
                    )}
                    {mode == 'subcategory' && (
                        <SubcategoryForm
                            ref={formRef}
                            initialData={modalManager.item as ISubcategory}
                            inEditingMode={modalManager.inEditingMode}
                            dataCallback={handleFormSubmit}
                            closeDialog={modalManager.closeModal}
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
