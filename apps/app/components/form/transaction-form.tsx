import { IncomeForm } from '../form/transactions/income-form'
import { useRef, useState } from 'react'
import { IItem, ITransaction, InputVariantStyle } from '@poveroh/types'
import { TransferForm } from '../form/transactions/transfer-form'
import { useTransaction } from '@/hooks/use-transaction'
import { ExpensesForm } from '../form/transactions/expenses-form'
import React, { forwardRef, useImperativeHandle } from 'react'
import { FormRef } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

type TransactionFormProps = {
    initialData?: ITransaction
    inputStyle?: InputVariantStyle
    inEditingMode?: boolean
    handleSubmit: (data: FormData) => Promise<void>
}

export const TransactionForm = forwardRef<FormRef, TransactionFormProps>((props: TransactionFormProps, ref) => {
    const { getActionList } = useTransaction()

    const [currentAction, setCurrentAction] = useState<string>(props.initialData?.action || 'EXPENSES')
    const formRef = useRef<FormRef | null>(null)

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit()
        }
    }))

    return (
        <div className='flex flex-col space-y-6 w-full'>
            <Tabs defaultValue={currentAction} value={currentAction} onValueChange={setCurrentAction}>
                <TabsList className='grid w-full grid-cols-3'>
                    {getActionList().map((item: IItem) => (
                        <TabsTrigger key={item.value} value={item.value.toString()}>
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {currentAction == 'INCOME' && (
                <IncomeForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode || false}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}
            {currentAction == 'EXPENSES' && (
                <ExpensesForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode || false}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}

            {currentAction == 'INTERNAL' && (
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
