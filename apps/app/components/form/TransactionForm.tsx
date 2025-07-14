import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { IncomeForm } from '../form/transactions/IncomeForm'
import { useEffect, useRef, useState } from 'react'
import { FormRef, IItem, InputVariantStyle, ITransaction } from '@poveroh/types'
import { TransferForm } from '../form/transactions/TransferForm'
import { useTransaction } from '@/hooks/useTransaction'
import { ExpensesForm } from '../form/transactions/ExpensesForm'
import React, { forwardRef, useImperativeHandle } from 'react'

type TransactionFormProps = {
    initialData?: ITransaction
    action: string
    inputStyle?: InputVariantStyle
    inEditingMode?: boolean
    setAction?: (action: string) => void
    handleSubmit: (data: FormData) => Promise<void>
}

export const TransactionForm = forwardRef<FormRef, TransactionFormProps>((props: TransactionFormProps, ref) => {
    const t = useTranslations()

    const { getActionList } = useTransaction()
    const [localCurrentAction, setLocalCurrentAction] = useState<string>(props.action || 'EXPENSES')
    const formRef = useRef<FormRef | null>(null)

    useEffect(() => {
        if (props.action) {
            setLocalCurrentAction(props.action)
        }
    }, [props.action])

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.submit()
        }
    }))

    return (
        <div className='flex flex-col space-y-6 w-full'>
            <Select onValueChange={setLocalCurrentAction} defaultValue={localCurrentAction}>
                <SelectTrigger variant={props.inputStyle || 'contained'}>
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
