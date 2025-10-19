import { z } from 'zod'
import { TransactionAction } from '@poveroh/types'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { BaseTransactionFormConfig, IncomeFormData, TransactionFormProps, amountSchema } from '@/types/form'

const defaultIncomeValues: IncomeFormData = {
    title: '',
    date: new Date().toISOString().split('T')[0]!, // Format as YYYY-MM-DD
    amount: 0,
    currency: '',
    accountId: '',
    categoryId: '',
    subcategoryId: '',
    note: '',
    ignore: false
}

const transformIncomeData = (data: unknown): Partial<IncomeFormData> => {
    if (!data || typeof data !== 'object') return {}

    const transaction = data as Record<string, unknown>

    console.log('🔍 transformIncomeData - Raw data:', data)

    // Handle amounts array - Income data comes with amounts structure like Expenses
    const amounts = transaction.amounts as Array<{ amount: number; accountId: string; currency: string }> | undefined
    const firstAmount = amounts?.[0]

    const transformed = {
        title: (transaction.title as string) || '',
        date: transaction.date
            ? new Date(transaction.date as string).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        amount: Math.abs(Number(firstAmount?.amount || transaction.amount) || 0), // Get from amounts array
        currency: firstAmount?.currency || (transaction.currencyId as string) || '',
        accountId: firstAmount?.accountId || (transaction.accountId as string) || '',
        categoryId: (transaction.categoryId as string) || '',
        subcategoryId: (transaction.subcategoryId as string) || '',
        note: (transaction.note as string) || '',
        ignore: (transaction.ignore as boolean) || false
    }

    console.log('🔍 transformIncomeData - Transformed data:', transformed)
    return transformed
}

// Create the income schema
const incomeSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    amount: amountSchema({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number'
    }),
    currency: z.string().min(1, 'Currency is required'),
    accountId: z.string().min(1, 'Account is required'),
    categoryId: z.string().min(1, 'Category is required'),
    subcategoryId: z.string().min(1, 'Subcategory is required'),
    note: z.string().optional(),
    ignore: z.boolean().default(false)
})

const incomeConfig: BaseTransactionFormConfig<IncomeFormData> = {
    type: TransactionAction.INCOME,
    defaultValues: defaultIncomeValues,
    schema: incomeSchema,
    transformInitialData: transformIncomeData
}

export function useIncomeForm(props: TransactionFormProps) {
    const baseForm = useBaseTransactionForm<IncomeFormData>(incomeConfig, props)

    return baseForm
}
