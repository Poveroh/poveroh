import { z } from 'zod'
import { useFieldArray } from 'react-hook-form'
import { ExpensesFormData, ITransaction, TransactionAction } from '@poveroh/types'
import { useBaseTransactionForm } from './use-base-transaction-form'
import { BaseTransactionFormConfig, TransactionFormProps, amountSchema } from '@/types/form'

const defaultExpensesValues: ExpensesFormData = {
    title: '',
    date: new Date().toISOString().split('T')[0]!, // Format as YYYY-MM-DD
    currency: '',
    totalAmount: 0,
    multipleAmount: false,
    amounts: [],
    totalFinancialAccountId: '',
    categoryId: '',
    subcategoryId: '',
    note: '',
    ignore: false
}

const transformExpensesData = (data: ITransaction): ExpensesFormData => {
    if (!data || typeof data !== 'object') return defaultExpensesValues

    const transaction = data as ITransaction

    // Handle amounts array if present
    const amounts = transaction.amounts as
        | Array<{ amount: number; financialAccountId: string; currency?: string }>
        | undefined
    const hasMultipleAmounts = amounts && amounts.length > 1

    return {
        title: (transaction.title as string) || '',
        date: transaction.date
            ? new Date(transaction.date as string).toISOString().split('T')[0]!
            : new Date().toISOString().split('T')[0]!,
        currency: amounts?.[0]?.currency || '',
        totalAmount: Math.abs(Number(amounts?.[0]?.amount || 0)), // Ensure positive for expenses
        multipleAmount: hasMultipleAmounts || false,
        amounts: hasMultipleAmounts
            ? amounts?.map(amt => ({ amount: Math.abs(amt.amount), financialAccountId: amt.financialAccountId }))
            : [],
        totalFinancialAccountId: hasMultipleAmounts ? '' : amounts?.[0]?.financialAccountId || '',
        categoryId: (transaction.categoryId as string) || '',
        subcategoryId: (transaction.subcategoryId as string) || '',
        note: (transaction.note as string) || '',
        ignore: (transaction.ignore as boolean) || false
    }
}

// Create the expenses schema
const baseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    date: z.string().min(1, 'Date is required'),
    currency: z.string().min(1, 'Currency is required'),
    totalAmount: amountSchema({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number'
    }),
    categoryId: z.string().min(1, 'Category is required'),
    subcategoryId: z.string().min(1, 'Subcategory is required'),
    note: z.string().optional(),
    ignore: z.boolean().default(false)
})

const amountsSchema = baseSchema.extend({
    multipleAmount: z.literal(true),
    amounts: z
        .array(
            z.object({
                amount: amountSchema({
                    required_error: 'Amount is required',
                    invalid_type_error: 'Amount must be a number'
                }),
                financialAccountId: z.string().min(1, 'Account is required')
            })
        )
        .min(1, 'At least one amount is required')
})

const accountSchema = baseSchema.extend({
    multipleAmount: z.literal(false),
    totalAccountId: z.string().min(1, 'Account is required')
})

const expensesSchema = z.discriminatedUnion('multipleAmount', [amountsSchema, accountSchema])

const expensesConfig: BaseTransactionFormConfig<ExpensesFormData> = {
    type: TransactionAction.EXPENSES,
    defaultValues: defaultExpensesValues,
    schema: expensesSchema,
    transformInitialData: transformExpensesData
}

export function useExpensesForm(props: TransactionFormProps) {
    const baseForm = useBaseTransactionForm<ExpensesFormData>(expensesConfig, props)

    const fieldArray = useFieldArray({
        name: 'amounts',
        control: baseForm.form.control
    })

    const multipleAmount = baseForm.form.watch('multipleAmount')

    const calculateTotal = () => {
        const values = baseForm.form.getValues()
        if (values.amounts && Array.isArray(values.amounts)) {
            return values.amounts.reduce((acc: number, curr: { amount: number }) => acc + (curr.amount || 0), 0)
        }
        return 0
    }

    const toggleMultipleAmount = () => {
        baseForm.form.setValue('multipleAmount', !multipleAmount)
    }

    return {
        ...baseForm,
        fieldArray,
        multipleAmount,
        calculateTotal,
        toggleMultipleAmount
    }
}
