import { useTranslations } from 'next-intl'
import { Modal } from '../modal/dialog'
import { useRef, useState } from 'react'
import { IImports } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { UploadForm } from '../form/transactions/UploadForm'
import { useImports } from '@/hooks/useImports'

type DialogProps = {
    open: boolean
    initialData?: IImports
    dialogHeight?: string
    inEditingMode: boolean
    closeDialog: () => void
}

export function ImportDialog(props: DialogProps) {
    const t = useTranslations()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [localImports, setLocalImports] = useState<IImports | undefined>(props.initialData)

    const { completeImports } = useImports()

    const [loading, setLoading] = useState(false)
    const [saveDisabled, setSaveDisabled] = useState(props.initialData ? false : true)
    const [showSaveButton, setShowSaveButton] = useState(props.initialData ? true : false)
    const [askForConfirmation, setAskForConfirmation] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const generateTitle = () => {
        return t(`imports.modal.${props.inEditingMode ? 'editTitle' : 'uploadTitle'}`)
    }

    const handleFormSubmit = async (data: IImports) => {
        setLoading(true)

        const res: IImports | null = await completeImports(data.id)

        if (!res) {
            setLoading(false)
            return
        }

        toast.success(
            t('messages.successfully', {
                a: props.initialData?.title,
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLocalImports(res)

        setLoading(false)

        props.closeDialog()
    }

    const handleShowSaveButton = (enable?: boolean) => {
        setSaveDisabled(!enable)
        setShowSaveButton(true)
    }

    return (
        <Modal
            open={props.open}
            title={generateTitle()}
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={false}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            hideKeepAdding={true}
            dialogHeight={props.dialogHeight}
            buttonDisabled={saveDisabled}
            showSaveButton={showSaveButton}
            confirmButtonText='modal.confirmationDialog.complete'
            askForConfirmation={askForConfirmation}
            onClick={() => formRef.current?.submit()}
        >
            <UploadForm
                ref={formRef}
                initialData={localImports}
                dataCallback={handleFormSubmit}
                showSaveButton={handleShowSaveButton}
                closeDialog={props.closeDialog}
            ></UploadForm>
        </Modal>
    )
}
