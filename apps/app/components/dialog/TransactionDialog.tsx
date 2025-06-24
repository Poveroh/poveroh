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
import { UploadForm } from '../form/transactions/UploadForm'

type DialogProps = {
    open: boolean
    initialData?: ITransaction
    mode: 'upload' | 'edit' | 'add'
    dialogHeight?: string
    closeDialog: () => void
}

export function TransactionDialog(props: DialogProps) {
    const t = useTranslations()

    const { getActionList, addTransaction, editTransaction } = useTransaction()
    const { fetchBankAccount } = useBankAccount()
    const { fetchCategory } = useCategory()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [disabled, setDisabled] = useState(props.mode == 'upload')
    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)

    const [currentAction, setCurrentAction] = useState<string>('EXPENSES')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        // fetchBankAccount()
        // fetchCategory()
    }

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
                b: t(props.mode == 'edit' ? 'messages.saved' : 'messages.uploaded')
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
            inEditingMode={props.mode == 'edit'}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            hideKeepAdding={true}
            dialogHeight={props.dialogHeight}
            buttonDisabled={disabled}
            onClick={() => formRef.current?.submit()}
        >
            {props.mode == 'upload' ? (
                <UploadForm ref={formRef} dataCallback={handleFormSubmit} closeDialog={props.closeDialog}></UploadForm>
            ) : (
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
                            inEditingMode={props.mode == 'edit'}
                            dataCallback={handleFormSubmit}
                            closeDialog={props.closeDialog}
                        ></IncomeForm>
                    )}
                    {currentAction == 'EXPENSES' && (
                        <ExpensesForm
                            ref={formRef}
                            initialData={props.initialData}
                            inEditingMode={props.mode == 'edit'}
                            dataCallback={handleFormSubmit}
                            closeDialog={props.closeDialog}
                        ></ExpensesForm>
                    )}
                    {currentAction == 'INTERNAL' && (
                        <TransferForm
                            ref={formRef}
                            initialData={props.initialData}
                            inEditingMode={props.mode == 'edit'}
                            dataCallback={handleFormSubmit}
                            closeDialog={props.closeDialog}
                        ></TransferForm>
                    )}
                </div>
            )}
        </Modal>
    )
}
