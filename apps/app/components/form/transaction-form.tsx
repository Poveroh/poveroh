import { IncomeForm } from '../form/transactions/income-form'
import { useEffect, useRef, useState } from 'react'
import { IItem, ITransaction, InputVariantStyle } from '@poveroh/types'
import { TransferForm } from '../form/transactions/transfer-form'
import { useTransaction } from '@/hooks/use-transaction'
import { ExpensesForm } from '../form/transactions/expenses-form'
import React, { forwardRef, useImperativeHandle } from 'react'
import { useCategory } from '@/hooks/use-category'
import { useAccount } from '@/hooks/use-account'
import { FormRef } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

type TransactionFormProps = {
    initialData?: ITransaction
    action: string
    inputStyle?: InputVariantStyle
    inEditingMode?: boolean
    setAction?: (action: string) => void
    handleSubmit: (data: FormData) => Promise<void>
}

export const TransactionForm = forwardRef<FormRef, TransactionFormProps>((props: TransactionFormProps, ref) => {
    const { getActionList } = useTransaction()

    const { fetchCategory } = useCategory()
    const { fetchAccount } = useAccount()

    const [localCurrentAction, setLocalCurrentAction] = useState<string>(props.action || 'EXPENSES')
    const formRef = useRef<FormRef | null>(null)

    useEffect(() => {
        if (props.action) {
            setLocalCurrentAction(props.action)
        }
    }, [props.action])

    useEffect(() => {
        const fetchData = async () => {
            await fetchCategory()
            await fetchAccount()
        }
        fetchData()
    }, [])

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit()
        }
    }))

    return (
        <div className='flex flex-col space-y-6 w-full'>
            <Tabs defaultValue={localCurrentAction} value={localCurrentAction} onValueChange={setLocalCurrentAction}>
                <TabsList className='grid w-full grid-cols-3'>
                    {getActionList().map((item: IItem) => (
                        <TabsTrigger key={item.value} value={item.value.toString()}>
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {localCurrentAction == 'INCOME' && (
                <IncomeForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode || false}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}
            {localCurrentAction == 'EXPENSES' && (
                <ExpensesForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode || false}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}

            {localCurrentAction == 'INTERNAL' && (
                <TransferForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode || false}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}
        </div>
    )
})

TransactionForm.displayName = 'TransactionForm'
