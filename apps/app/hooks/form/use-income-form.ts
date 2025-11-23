import { z } from 'zod'
import { IncomeFormData, ITransaction, TransactionAction } from '@poveroh/types'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { BaseTransactionFormConfig, TransactionFormProps, amountSchema } from '@/types/form'
import { useConfig } from '../use-config'

export function useIncomeForm(props: TransactionFormProps) {
    const { preferedCurrency } = useConfig()

    const defaultIncomeValues: IncomeFormData = {
        title: '',
        date: new Date().toISOString().split('T')[0]!, // Format as YYYY-MM-DD
        amount: 0,
        currency: preferedCurrency,
        financialAccountId: '',
        categoryId: '',
        subcategoryId: '',
        note: '',
        ignore: false
    }

    const transformIncomeData = (data: ITransaction): IncomeFormData => {
        if (!data || typeof data !== 'object') return defaultIncomeValues

        const transaction = data as ITransaction

        console.log('🔍 transformIncomeData - Raw data:', data)

        // Handle amounts array - Income data comes with amounts structure like Expenses
        const amounts = transaction.amounts as
            | Array<{ amount: number; financialAccountId: string; currency: string }>
            | undefined
        const firstAmount = amounts?.[0]

        const transformed = {
            title: (transaction.title as string) || '',
            date: transaction.date
                ? new Date(transaction.date as string).toISOString().split('T')[0]!
                : new Date().toISOString().split('T')[0]!,
            amount: Math.abs(Number(firstAmount?.amount || 0)), // Get from amounts array
            currency: firstAmount?.currency || '',
            financialAccountId: firstAmount?.financialAccountId || '',
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
        financialAccountId: z.string().min(1, 'Account is required'),
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

    return useBaseTransactionForm<IncomeFormData>(incomeConfig, props)
}
