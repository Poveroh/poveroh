import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { useRef, useState } from 'react'
import { IBankAccount } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useBankAccount } from '@/hooks/useBankAccount'
import { BankAccountForm } from '../form/BankaccountForm'

type DialogProps = {
    open: boolean
    initialData?: IBankAccount | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function BankAccountDialog(props: DialogProps) {
    const t = useTranslations()
    const { addBankAccount, editBankAccount } = useBankAccount()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const title =
        props.inEditingMode && props.initialData
            ? t('bankAccounts.modal.editTitle', { a: props.initialData?.title })
            : t('bankAccounts.modal.newTitle')

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: IBankAccount | null

        // edit dialog
        if (props.inEditingMode) {
            res = await editBankAccount(data)

            if (!res) return

            props.closeDialog()
        } else {
            // new dialog
            res = await addBankAccount(data)

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
                <BankAccountForm
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
