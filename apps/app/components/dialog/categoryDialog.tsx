import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { ICategory } from '@poveroh/types'
import { useCache } from '@/hooks/useCache'
import { CategoryService } from '@/services/category.service'
import { Modal } from '../modal/form'
import { CategoryForm } from '../form/CategoryForm'

type DialogProps = {
    open: boolean
    initialData?: ICategory | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function CategoryDialog(props: DialogProps) {
    const t = useTranslations()
    const { categoryCache } = useCache()

    const categoryService = new CategoryService()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const [title, setTitle] = useState(
        props.inEditingMode && props.initialData
            ? t('categories.modal.editTitle', {
                  a: props.initialData?.title
              })
            : t('categories.modal.newTitle')
    )

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let resCategory: ICategory | null = null

        // edit dialog
        if (props.inEditingMode) {
            resCategory = await categoryService.save(data)
            categoryCache.edit(resCategory)
            props.closeDialog()
        } else {
            // new dialog
            resCategory = await categoryService.add(data)
            categoryCache.add(resCategory)

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
                <CategoryForm
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
