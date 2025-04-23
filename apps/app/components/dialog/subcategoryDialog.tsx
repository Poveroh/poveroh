import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { ICategory, ISubcategory } from '@poveroh/types'
import { useCache } from '@/hooks/useCache'
import { CategoryService, SubcategoryService } from '@/services/category.service'
import { Modal } from '../modal/form'
import { SubcategoryForm } from '../form/SubcategoryForm'
import { init } from 'next/dist/compiled/webpack/webpack'

type DialogProps = {
    open: boolean
    initialData?: ISubcategory | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function SubcategoryDialog(props: DialogProps) {
    const t = useTranslations()
    const { categoryCache } = useCache()

    const subcategoryService = new SubcategoryService()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const [title, setTitle] = useState(
        props.inEditingMode && props.initialData
            ? t('subcategories.modal.editTitle', {
                  a: props.initialData?.title
              })
            : t('subcategories.modal.newTitle')
    )

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let resSubcategory: ISubcategory | null = null

        // edit dialog
        if (props.inEditingMode) {
            resSubcategory = await subcategoryService.save(data)

            const resCategory = categoryCache.get(resSubcategory?.category_id)

            categoryCache.edit(resSubcategory)
            props.closeDialog()
        } else {
            // new dialog
            resSubcategory = await subcategoryService.add(data)
            categoryCache.add(resSubcategory)

            if (keepAdding) {
                formRef.current?.reset()
            } else {
                props.closeDialog()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: resCategory?.title,
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(false)
    }

    return (
        <Modal
            open={props.open}
            title={title}
            icon={props.initialData?.logo_icon}
            iconMode='icon'
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={props.inEditingMode}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            dialogHeight={props.dialogHeight}
            onClick={() => formRef.current?.submit()}
        >
            <div className='flex flex-col space-y-6 w-full'>
                <SubcategoryForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode}
                    dataCallback={handleFormSubmit}
                    closeDialog={props.closeDialog}
                />
            </div>
        </Modal>
    )
}
