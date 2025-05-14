import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { IncomeForm } from '../form/transactions/IncomeForm'
import { useEffect, useRef, useState } from 'react'
import { IItem, ITransaction } from '@poveroh/types'
import { TransferForm } from '../form/transactions/TransferForm'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/useTransaction'
import { useBankAccount } from '@/hooks/useBankAccount'
import { useCategory } from '@/hooks/useCategory'
import { ExpensesForm } from '../form/transactions/ExpensesForm'

type DialogProps = {
    open: boolean
    initialData?: ITransaction
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function TransactionDialog(props: DialogProps) {
    const t = useTranslations()

    const { getActionList, addTransaction, editTransaction } = useTransaction()
    const { fetchBankAccount } = useBankAccount()
    const { fetchCategory } = useCategory()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const [currentAction, setCurrentAction] = useState<string>('INTERNAL')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        await fetchBankAccount()
        await fetchCategory()
    }

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ITransaction | null

        // edit dialog
        if (props.inEditingMode) {
            res = await editTransaction(data)

            if (!res) return

            props.closeDialog()
        } else {
            // new dialog
            res = await addTransaction(data)

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
                        {getActionList().map((item: IItem) => (
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
                {currentAction == 'EXPENSES' && (
                    <ExpensesForm
                        ref={formRef}
                        initialData={props.initialData}
                        inEditingMode={props.inEditingMode}
                        dataCallback={handleFormSubmit}
                        closeDialog={props.closeDialog}
                    ></ExpensesForm>
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
