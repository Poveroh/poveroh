import { z } from 'zod'
import { useEffect } from 'react'
import { TransactionAction, IAccount } from '@poveroh/types'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { TransferFormData, TransactionFormProps, amountSchema, BaseTransactionFormConfig } from '@/types/form'
import { useAccount } from '@/hooks/use-account'

const defaultTransferValues: TransferFormData = {
    title: '',
    date: new Date().toISOString().split('T')[0]!, // Format as YYYY-MM-DD
    amount: 0,
    currency: '',
    from: '',
    to: '',
    note: '',
    ignore: false
}

const transformTransferData = (data: unknown): Partial<TransferFormData> => {
    if (!data || typeof data !== 'object') return {}

    const transaction = data as Record<string, unknown>

    return {
        title: (transaction.title as string) || (transaction.description as string) || '',
        date: transaction.date
            ? new Date(transaction.date as string).toISOString().split('T')[0]!
            : new Date().toISOString().split('T')[0]!,
        amount: Math.abs(Number(transaction.amount) || 0), // Ensure positive
        currency: (transaction.currencyId as string) || '',
        from: (transaction.fromAccountId as string) || '',
        to: (transaction.toAccountId as string) || '',
        note: (transaction.note as string) || '',
        ignore: (transaction.ignore as boolean) || false
    }
}

// Create the transfer schema
const transferSchema = z
    .object({
        title: z.string().min(1, 'Title is required'),
        date: z.string().min(1, 'Date is required'),
        amount: amountSchema({
            required_error: 'Amount is required',
            invalid_type_error: 'Amount must be a number'
        }),
        currency: z.string().min(1, 'Currency is required'),
        from: z.string().min(1, 'From account is required'),
        to: z.string().min(1, 'To account is required'),
        note: z.string().optional(),
        ignore: z.boolean().default(false)
    })
    .refine(data => data.from !== data.to, {
        message: 'From and To accounts must be different',
        path: ['to']
    })

const transferConfig: BaseTransactionFormConfig<TransferFormData> = {
    type: TransactionAction.TRANSFER,
    defaultValues: defaultTransferValues,
    schema: transferSchema,
    transformInitialData: transformTransferData
}

export function useTransferForm(props: TransactionFormProps) {
    const baseForm = useBaseTransactionForm<TransferFormData>(transferConfig, props)
    const { accountCacheList } = useAccount()

    // Set account field values only after account cache is loaded
    useEffect(() => {
        const amounts = props.initialData?.amounts
        if (amounts && amounts.length >= 1 && accountCacheList?.length > 0) {
            const fromAccountId = amounts[0]?.accountId
            const toAccountId = amounts[1]?.accountId

            if (fromAccountId && accountCacheList.some((acc: IAccount) => acc.id === fromAccountId)) {
                baseForm.form.setValue('from', fromAccountId, { shouldValidate: true })
            }
            if (toAccountId && accountCacheList.some((acc: IAccount) => acc.id === toAccountId)) {
                baseForm.form.setValue('to', toAccountId, { shouldValidate: true })
            }
        }
    }, [accountCacheList, props.initialData, baseForm.form])

    return baseForm
}
