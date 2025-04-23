import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { IncomeForm } from '../form/transactions/IncomeForm'
import { useRef, useState } from 'react'
import { TransactionService } from '@/services/transaction.service'
import { IItem, ITransaction } from '@poveroh/types'
import { TransferForm } from '../form/transactions/TransferForm'
import { toast } from '@poveroh/ui/components/sonner'

type DialogProps = {
    open: boolean
    initialData?: ITransaction
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function TransactionDialog(props: DialogProps) {
    const t = useTranslations()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const [currentAction, setCurrentAction] = useState<string>('INCOME')

    const transactionService = new TransactionService()
    const transactionActions = transactionService.getActionList(t)

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        console.log('Submitted data:', data)

        toast.success(
            t('messages.successfully', {
                a: '',
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(true)
    }

    return (
        <Modal
            open={props.open}
            title={t('transactions.modal.newTitle')}
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={props.inEditingMode}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            dialogHeight={props.dialogHeight}
            onClick={() => formRef.current?.submit()}
        >
            <div className='flex flex-col space-y-6 w-full'>
                <Select onValueChange={setCurrentAction} defaultValue={currentAction}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('form.type.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {transactionActions.map((item: IItem) => (
                            <SelectItem key={item.value} value={item.value.toString()}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {currentAction == 'INCOME' && (
                    <IncomeForm
                        ref={formRef}
                        initialData={props.initialData}
                        inEditingMode={props.inEditingMode}
                        dataCallback={handleFormSubmit}
                        closeDialog={props.closeDialog}
                    ></IncomeForm>
                )}
                {currentAction == 'INTERNAL' && (
                    <TransferForm
                        ref={formRef}
                        initialData={props.initialData}
                        inEditingMode={props.inEditingMode}
                        dataCallback={handleFormSubmit}
                        closeDialog={props.closeDialog}
                    ></TransferForm>
                )}
            </div>
        </Modal>
    )
}
