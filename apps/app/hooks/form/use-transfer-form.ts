import { z } from 'zod'
import { TransactionAction } from '@poveroh/types'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { TransferFormData, TransactionFormProps, amountSchema, BaseTransactionFormConfig } from '@/types/form'

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

    console.log('🔍 transformTransferData - Raw data:', data)

    // Handle amounts array - Transfer data comes with amounts structure
    const amounts = transaction.amounts as
        | Array<{ amount: number; accountId: string; currency: string; action: string }>
        | undefined

    // Find the from (EXPENSES) and to (INCOME) accounts from amounts
    const fromAmount = amounts?.find(amt => amt.action === 'EXPENSES')
    const toAmount = amounts?.find(amt => amt.action === 'INCOME')
    const firstAmount = amounts?.[0] // For amount and currency fallback

    const transformed = {
        title: (transaction.title as string) || (transaction.description as string) || '',
        date: transaction.date
            ? new Date(transaction.date as string).toISOString().split('T')[0]!
            : new Date().toISOString().split('T')[0]!,
        amount: Math.abs(Number(firstAmount?.amount || transaction.amount) || 0), // Ensure positive
        currency: firstAmount?.currency || (transaction.currencyId as string) || '',
        from: fromAmount?.accountId || '',
        to: toAmount?.accountId || '',
        note: (transaction.note as string) || '',
        ignore: (transaction.ignore as boolean) || false
    }

    console.log('🔍 transformTransferData - Transformed data:', transformed)
    return transformed
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

    return baseForm
}
