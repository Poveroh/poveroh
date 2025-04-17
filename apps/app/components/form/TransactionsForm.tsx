'use client'

import { useTranslations } from 'next-intl'
import { IItem, ITransaction } from '@poveroh/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { TransactionService } from '@/services/transaction.service'
import { useState } from 'react'
import { IncomeForm } from './transactions/IncomeForm'

type BankAccountFormProps = {
    initialData?: ITransaction
    inEditingMode: boolean
    onSubmit: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export function TransactionsForm({ initialData, inEditingMode, onSubmit, closeDialog }: BankAccountFormProps) {
    const t = useTranslations()

    const [currentAction, setCurrentAction] = useState<string>('expenses')

    const transactionService = new TransactionService()
    const transactionActions = transactionService.getActionList(t)

    return (
        <div className='flex flex-col space-y-6 w-full'>
            <Select onValueChange={setCurrentAction}>
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

            <IncomeForm
                initialData={initialData}
                inEditingMode={inEditingMode}
                onSubmit={onSubmit}
                closeDialog={closeDialog}
            ></IncomeForm>
        </div>
    )
}
