import { IncomeForm } from '../form/transactions/income-form'
import { useRef, useState } from 'react'
import { IItem } from '@poveroh/types'
import { TransferForm } from '../form/transactions/transfer-form'
import { useTransaction } from '@/hooks/use-transaction'
import { ExpensesForm } from '../form/transactions/expenses-form'
import React, { forwardRef, useImperativeHandle } from 'react'
import { FormRef, TransactionFormProps } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

export const TransactionForm = forwardRef<FormRef, TransactionFormProps>((props: TransactionFormProps, ref) => {
    const { getActionList } = useTransaction()

    const [currentAction, setCurrentAction] = useState<string>(props.initialData?.action || 'EXPENSES')
    const formRef = useRef<FormRef | null>(null)

    useImperativeHandle(
        ref,
        () => ({
            submit: () => {
                if (formRef.current) {
                    formRef.current.submit()
                }
            }
        }),
        []
    )

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

            {currentAction == 'INCOME' && <IncomeForm ref={formRef} {...props} />}
            {currentAction == 'EXPENSES' && <ExpensesForm ref={formRef} {...props} />}
            {currentAction == 'TRANSFER' && <TransferForm ref={formRef} {...props} />}
        </div>
    )
})

TransactionForm.displayName = 'TransactionForm'
