import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { AppearanceMode, ICategory } from '@poveroh/types'
import { Modal } from '../modal/dialog'
import { CategoryForm } from '../form/CategoryForm'
import { useCategory } from '@/hooks/useCategory'

type DialogProps = {
    open: boolean
    initialData?: ICategory | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function CategoryDialog(props: DialogProps) {
    const t = useTranslations()
    const { editCategory, addCategory } = useCategory()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const title =
        props.inEditingMode && props.initialData
            ? t('categories.modal.editTitle', { a: props.initialData?.title })
            : t('categories.modal.newTitle')

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ICategory | null

        // edit dialog
        if (props.inEditingMode && props.initialData) {
            res = await editCategory(props.initialData.id, data)

            if (!res) return

            props.closeDialog()
        } else {
            // new dialog
            res = await addCategory(data)

            if (!res) return

            if (keepAdding) {
                formRef.current?.reset()
            } else {
                props.closeDialog()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(false)
    }

    return (
        <Modal
            open={props.open}
            title={title}
            icon={props.initialData?.logoIcon}
            iconMode={AppearanceMode.ICON}
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
