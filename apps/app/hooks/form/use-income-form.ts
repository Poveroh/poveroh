import { z } from 'zod'
import { useEffect } from 'react'
import { TransactionAction, IAccount } from '@poveroh/types'
import { useBaseTransactionForm, BaseTransactionFormConfig } from './use-base-transaction-form'
import { IncomeFormData, TransactionFormProps, amountSchema } from '@/types/form'
import { useAccount } from '@/hooks/use-account'

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

    return {
        title: (transaction.title as string) || (transaction.description as string) || '',
        date: transaction.date
            ? new Date(transaction.date as string).toISOString().split('T')[0]!
            : new Date().toISOString().split('T')[0]!,
        amount: Math.abs(Number(transaction.amount) || 0), // Ensure positive for income
        currency: (transaction.currencyId as string) || '',
        accountId: (transaction.accountId as string) || '',
        categoryId: (transaction.categoryId as string) || '',
        subcategoryId: (transaction.subcategoryId as string) || '',
        note: (transaction.note as string) || '',
        ignore: (transaction.ignore as boolean) || false
    }
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
    const { accountCacheList } = useAccount()

    // Set account field value only after account cache is loaded
    useEffect(() => {
        const accountId = props.initialData?.amounts?.[0]?.accountId
        if (accountId && accountCacheList?.some((acc: IAccount) => acc.id === accountId)) {
            baseForm.setFieldValue('accountId', accountId)
        }
    }, [accountCacheList, baseForm, props.initialData])

    return baseForm
}
