import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { useRef, useState } from 'react'
import { ITransaction } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/useTransaction'
import { UploadForm } from '../form/transactions/UploadForm'
import { TransactionForm } from '../form/TransactionForm'

type DialogProps = {
    open: boolean
    initialData?: ITransaction
    mode: 'upload' | 'edit' | 'add'
    dialogHeight?: string
    closeDialog: () => void
}

export function TransactionDialog(props: DialogProps) {
    const t = useTranslations()

    const { addTransaction, editTransaction } = useTransaction()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [saveDisabled, setSaveDisabled] = useState(props.mode == 'upload')
    const [showSaveButton, setShowSaveButton] = useState(props.mode != 'upload')
    const [keepAdding, setKeepAdding] = useState(false)

    const [currentAction, setCurrentAction] = useState<string>('EXPENSES')

    const generateTitle = () => {
        let suffixTitle = ''

        switch (props.mode) {
            case 'upload':
                suffixTitle = 'uploadTitle'
                break
            case 'add':
                suffixTitle = 'newTitle'
                break
            case 'edit':
                suffixTitle = 'editTitle'
                break
        }

        return t(`transactions.modal.${suffixTitle}`)
    }

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ITransaction | null

        // edit dialog
        if (props.mode == 'edit' && props.initialData) {
            res = await editTransaction(props.initialData.id, data)

            if (!res) {
                setLoading(false)
                return
            }

            props.closeDialog()
        } else {
            // new dialog
            res = await addTransaction(data)

            if (!res) {
                setLoading(false)
                return
            }

            if (keepAdding) {
                formRef.current?.reset()
            } else {
                props.closeDialog()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
                b: t(props.mode == 'edit' ? 'messages.saved' : 'messages.uploaded')
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
            inEditingMode={props.mode == 'edit'}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            hideKeepAdding={true}
            dialogHeight={props.dialogHeight}
            buttonDisabled={saveDisabled}
            showSaveButton={showSaveButton}
            onClick={() => formRef.current?.submit()}
        >
            {props.mode == 'upload' ? (
                <UploadForm
                    ref={formRef}
                    dataCallback={handleFormSubmit}
                    showSaveButton={handleShowSaveButton}
                    closeDialog={props.closeDialog}
                ></UploadForm>
            ) : (
                <TransactionForm
                    ref={formRef}
                    initialData={props.initialData}
                    mode={props.mode}
                    action={currentAction}
                    inputStyle='contained'
                    setAction={setCurrentAction}
                    handleSubmit={handleFormSubmit}
                ></TransactionForm>
            )}
        </Modal>
    )
}
