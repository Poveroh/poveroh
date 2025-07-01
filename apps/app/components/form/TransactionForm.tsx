import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { IncomeForm } from '../form/transactions/IncomeForm'
import { use, useEffect, useRef, useState } from 'react'
import { IItem, InputVariantStyle, ITransaction } from '@poveroh/types'
import { TransferForm } from '../form/transactions/TransferForm'
import { useTransaction } from '@/hooks/useTransaction'
import { ExpensesForm } from '../form/transactions/ExpensesForm'
import React, { forwardRef, useImperativeHandle } from 'react'

type TransactionFormProps = {
    initialData?: ITransaction
    mode: 'upload' | 'edit' | 'add'
    action: string
    inputStyle?: InputVariantStyle
    setAction?: (action: string) => void
    handleSubmit: (data: FormData) => Promise<void>
}

export const TransactionForm = forwardRef<HTMLFormElement, TransactionFormProps>((props, ref) => {
    const t = useTranslations()

    const { getActionList } = useTransaction()
    const [localCurrentAction, setLocalCurrentAction] = useState<string>(props.action || 'EXPENSES')
    const formRef = useRef<HTMLFormElement | null>(null)

    useEffect(() => {
        if (props.action) {
            setLocalCurrentAction(props.action)
        }
    }, [props.action])

    useImperativeHandle(ref, () => formRef.current as HTMLFormElement, [])

    return (
        <div className='flex flex-col space-y-6 w-full'>
            <Select onValueChange={setLocalCurrentAction} defaultValue={localCurrentAction}>
                <SelectTrigger variant='outlined'>
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
                    inEditingMode={props.mode == 'edit'}
                    dataCallback={props.handleSubmit}
                />
            )}
            {localCurrentAction == 'EXPENSES' && (
                <ExpensesForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.mode == 'edit'}
                    dataCallback={props.handleSubmit}
                    inputStyle={props.inputStyle}
                />
            )}

            {localCurrentAction == 'INTERNAL' && (
                <TransferForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.mode == 'edit'}
                    dataCallback={props.handleSubmit}
                />
            )}
        </div>
    )
})

TransactionForm.displayName = 'TransactionForm'
