import { useTranslations } from 'next-intl'
import { Modal } from '@/components/modal/Dialog'
import { useRef, useState } from 'react'
import { ITransaction } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/useTransaction'
import { TransactionForm } from '../form/TransactionForm'

type DialogProps = {
    open: boolean
    initialData?: ITransaction
    inEditingMode?: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function TransactionDialog(props: DialogProps) {
    const t = useTranslations()

    const { addTransaction, editTransaction } = useTransaction()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(true)

    const [currentAction, setCurrentAction] = useState<string>('EXPENSES')

    const generateTitle = () => {
        const suffixTitle = props.inEditingMode ? 'editTitle' : 'newTitle'

        return t(`transactions.modal.${suffixTitle}`)
    }

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ITransaction | null

        // edit dialog
        if (props.inEditingMode && props.initialData) {
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
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(false)
    }

    return (
        <Modal
            open={props.open}
            title={generateTitle()}
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={props.inEditingMode || false}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            hideKeepAdding={true}
            dialogHeight={props.dialogHeight}
            showSaveButton={true}
            askForConfirmation={false}
            onClick={() => formRef.current?.submit()}
        >
            <TransactionForm
                ref={formRef}
                initialData={props.initialData}
                action={currentAction}
                inputStyle='contained'
                inEditingMode={props.inEditingMode || false}
                setAction={setCurrentAction}
                handleSubmit={handleFormSubmit}
            ></TransactionForm>
        </Modal>
    )
}
