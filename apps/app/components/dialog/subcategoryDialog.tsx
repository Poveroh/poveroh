import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { ISubcategory } from '@poveroh/types'
import { Modal } from '../modal/form'
import { SubcategoryForm } from '../form/SubcategoryForm'
import { useCategory } from '@/hooks/useCategory'

type DialogProps = {
    open: boolean
    initialData?: ISubcategory | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function SubcategoryDialog(props: DialogProps) {
    const t = useTranslations()
    const { addSubcategory, editSubcategory } = useCategory()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const [title] = useState(
        props.inEditingMode && props.initialData
            ? t('subcategories.modal.editTitle', {
                  a: props.initialData?.title
              })
            : t('subcategories.modal.newTitle')
    )

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ISubcategory

        // edit dialog
        if (props.inEditingMode) {
            res = await editSubcategory(data)
            props.closeDialog()
        } else {
            // new dialog
            res = await addSubcategory(data)

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
