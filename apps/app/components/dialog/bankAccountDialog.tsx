import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { useRef, useState } from 'react'
import { IBankAccount } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { BankAccountForm } from '../form/BankAccountForm'
import { BankAccountService } from '@/services/bankaccount.service'
import { useBankAccountStore } from '@/store/bankaccount.store'

type DialogProps = {
    open: boolean
    initialData?: IBankAccount | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function BankAccountDialog(props: DialogProps) {
    const t = useTranslations()
    const { add, edit } = useBankAccountStore()

    const bankAccountService = new BankAccountService()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const [title, setTitle] = useState(
        props.inEditingMode && props.initialData
            ? t('bankAccounts.modal.editTitle', {
                  a: props.initialData?.title
              })
            : t('bankAccounts.modal.newTitle')
    )

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let resAccount: IBankAccount | null = null

        // edit dialog
        if (props.inEditingMode) {
            resAccount = await bankAccountService.save(data)
            edit(resAccount)
            props.closeDialog()
        } else {
            // new dialog
            resAccount = await bankAccountService.add(data)
            add(resAccount)

            if (keepAdding) {
                formRef.current?.reset()
            } else {
                props.closeDialog()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: resAccount?.title,
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
