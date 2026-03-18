import { z } from 'zod'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { TransactionFormProps, amountSchema, BaseTransactionFormConfig } from '@/types/form'
import { useConfig } from '../use-config'
import { TransferFormData } from '@poveroh/types'
import { TransactionData } from '@poveroh/types/contracts'

export function useTransferForm(props: TransactionFormProps) {
    const { preferedCurrency } = useConfig()

    const defaultTransferValues: TransferFormData = {
        title: '',
        date: new Date().toISOString().split('T')[0]!, // Format as YYYY-MM-DD
        amount: 0,
        currency: preferedCurrency,
        from: '',
        to: '',
        note: '',
        ignore: false
    }

    const transformTransferData = (data: TransactionData): TransferFormData => {
        if (!data || typeof data !== 'object') return defaultTransferValues

        const transaction = data as TransactionData

        console.log('🔍 transformTransferData - Raw data:', data)

        // Handle amounts array - Transfer data comes with amounts structure
        const amounts = transaction.amounts as
            | Array<{ amount: number; financialAccountId: string; currency: string; action: string }>
            | undefined

        // Find the from (EXPENSES) and to (INCOME) accounts from amounts
        const fromAmount = amounts?.find(amt => amt.action === 'EXPENSES')
        const toAmount = amounts?.find(amt => amt.action === 'INCOME')
        const firstAmount = amounts?.[0] // For amount and currency fallback

        const transformed = {
            title: (transaction.title as string) || '',
            date: transaction.date ? transaction.date.split('T')[0]! : new Date().toISOString().split('T')[0]!,
            amount: Math.abs(Number(firstAmount?.amount || 0)), // Ensure positive
            currency: firstAmount?.currency || '',
            from: fromAmount?.financialAccountId || '',
            to: toAmount?.financialAccountId || '',
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
        type: 'TRANSFER',
        defaultValues: defaultTransferValues,
        schema: transferSchema,
        transformInitialData: transformTransferData
    }

    return useBaseTransactionForm<TransferFormData>(transferConfig, props)
}
