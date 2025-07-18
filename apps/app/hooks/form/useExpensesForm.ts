import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useTransactionForm } from '@/hooks/form/useTransactionForm'
import { TransactionAction, Currencies, ITransaction } from '@poveroh/types'
import { amountSchema } from '@/types/form'

interface UseExpensesFormProps {
    initialData?: ITransaction
    onSubmit: (formData: FormData) => Promise<void>
}

export function useExpensesForm({ initialData, onSubmit }: UseExpensesFormProps) {
    const t = useTranslations()

    const defaultAmounts = {
        amount: 0,
        bankAccountId: ''
    }

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        currency: Currencies.EUR,
        totalAmount: 0,
        amounts: [defaultAmounts],
        categoryId: '',
        subcategoryId: '',
        note: '',
        ignore: false,
        multipleAmount: false
    }

    // Create schema for expenses with discriminated union
    const baseSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        totalAmount: amountSchema({
            requiredError: t('messages.errors.required'),
            invalidTypeError: t('messages.errors.pattern')
        }),
        multipleAmount: z.boolean().default(false),
        currency: z.string().nonempty(t('messages.errors.required')),
        categoryId: z.string().nonempty(t('messages.errors.required')),
        subcategoryId: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
    })

    const amountsSchema = baseSchema.extend({
        multipleAmount: z.literal(true),
        amounts: z
            .array(
                z.object({
                    amount: amountSchema({
                        requiredError: t('messages.errors.required'),
                        invalidTypeError: t('messages.errors.pattern')
                    }),
                    bankAccountId: z.string().nonempty(t('messages.errors.required'))
                })
            )
            .min(1, t('messages.errors.required'))
    })

    const bankAccountSchema = baseSchema.extend({
        multipleAmount: z.literal(false),
        totalBankAccountId: z.string().nonempty(t('messages.errors.required'))
    })

    const expensesSchema = z.discriminatedUnion('multipleAmount', [amountsSchema, bankAccountSchema]).refine(
        data => {
            if (data.multipleAmount && 'amounts' in data) {
                const sum = data.amounts.reduce((acc, curr) => acc + curr.amount, 0)
                return sum === data.totalAmount
            }
            return true
        },
        {
            message: 'Total amount must match the sum of all amounts',
            path: ['totalAmount']
        }
    )

    const {
        form,
        subcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        setFileError,
        handleSubmit,
        categoryCacheList,
        bankAccountCacheList
    } = useTransactionForm({
        initialData: { ...defaultValues, ...initialData },
        action: TransactionAction.EXPENSES,
        onSubmit,
        customSchema: expensesSchema
    })

    const multipleAmount = form.watch('multipleAmount')

    // Toggle between single and multiple amounts
    const toggleMultipleAmount = useCallback(() => {
        form.setValue('multipleAmount', !multipleAmount)
    }, [form, multipleAmount])

    // Add new amount field (placeholder - handled by MultipleAmountField)
    const addAmountField = useCallback(() => {
        // This will be handled by the MultipleAmountField component internally
    }, [])

    // Remove amount field (placeholder - handled by MultipleAmountField)
    const removeAmountField = useCallback((index: number) => {
        // This will be handled by the MultipleAmountField component internally
        console.log('Remove field at index:', index)
    }, [])

    // Calculate total from individual amounts
    const calculateTotalAmount = useCallback(() => {
        const amounts = form.getValues('amounts') as Array<{ amount: number; bankAccountId: string }>
        const total = amounts.reduce((sum, amount) => sum + (amount.amount || 0), 0)
        form.setValue('totalAmount', total)
        return total
    }, [form])

    // Split amounts equally
    const splitAmounts = useCallback(() => {
        const totalAmount = form.getValues('totalAmount')
        const amounts = form.getValues('amounts') as Array<{ amount: number; bankAccountId: string }>

        if (typeof totalAmount === 'number' && totalAmount > 0 && amounts.length > 1) {
            const amountPerField = totalAmount / amounts.length
            const updatedAmounts = amounts.map(amount => ({
                ...amount,
                amount: amountPerField
            }))
            form.setValue('amounts', updatedAmounts)
        }
    }, [form])

    // Merge amounts to single
    const mergeAmounts = useCallback(() => {
        const amounts = form.getValues('amounts') as Array<{ amount: number; bankAccountId: string }>
        const totalAmount = amounts.reduce((sum, amount) => sum + (amount.amount || 0), 0)

        form.setValue('totalAmount', totalAmount)
        form.setValue('multipleAmount', false)
        form.setValue('amounts', [{ ...amounts[0], amount: totalAmount }])
    }, [form])

    return {
        form,
        multipleAmount,
        subcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        setFileError,
        handleSubmit,
        categoryCacheList,
        bankAccountCacheList,
        toggleMultipleAmount,
        addAmountField,
        removeAmountField,
        splitAmounts,
        mergeAmounts,
        calculateTotalAmount
    }
}
