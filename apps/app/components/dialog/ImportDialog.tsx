import { useTranslations } from 'next-intl'
import { Modal } from '../modal/dialog'
import { useRef, useState } from 'react'
import { IImports, ITransaction } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { UploadForm } from '../form/transactions/UploadForm'

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

    const [loading, setLoading] = useState(false)
    const [saveDisabled, setSaveDisabled] = useState(true)
    const [showSaveButton, setShowSaveButton] = useState(false)
    const [askForConfirmation, setAskForConfirmation] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const generateTitle = () => {
        // let suffixTitle = ''

        // switch (props.mode) {
        //     case 'upload':
        //         suffixTitle = 'uploadTitle'
        //         break
        //     case 'add':
        //         suffixTitle = 'newTitle'
        //         break
        //     case 'edit':
        //         suffixTitle = 'editTitle'
        //         break
        // }

        // return t(`transactions.modal.${suffixTitle}`)

        return ''
    }

    const handleFormSubmit = async (data: FormData) => {
        setAskForConfirmation(true)
        setLoading(true)

        let res: ITransaction | null

        // edit dialog
        // if (props.mode == 'edit' && props.initialData) {
        //     res = await editTransaction(props.initialData.id, data)

        //     if (!res) {
        //         setLoading(false)
        //         return
        //     }

        //     props.closeDialog()
        // } else {
        //     // new dialog
        //     res = await addTransaction(data)

        //     if (!res) {
        //         setLoading(false)
        //         return
        //     }

        //     if (keepAdding) {
        //         formRef.current?.reset()
        //     } else {
        //         props.closeDialog()
        //     }
        // }

        toast.success(
            t('messages.successfully', {
                a: props.initialData?.title,
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(false)
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
            askForConfirmation={askForConfirmation}
            onClick={() => formRef.current?.submit()}
        >
            <UploadForm
                ref={formRef}
                initialData={props.initialData}
                dataCallback={handleFormSubmit}
                showSaveButton={handleShowSaveButton}
                closeDialog={props.closeDialog}
            ></UploadForm>
        </Modal>
    )
}
