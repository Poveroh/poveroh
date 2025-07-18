import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useTransactionForm } from './useTransactionForm'
import { ITransaction, TransactionAction } from '@poveroh/types'
import { amountSchema } from '@/types/form'

type UseTransferFormProps = {
    initialData?: ITransaction
    onSubmit: (formData: FormData) => Promise<void>
}

export function useTransferForm({ initialData, onSubmit }: UseTransferFormProps) {
    const t = useTranslations()

    // Transfer-specific schema with validation for different bank accounts
    const transferSchema = z
        .object({
            title: z.string().nonempty(t('messages.errors.required')),
            date: z.string({
                required_error: t('messages.errors.required')
            }),
            currency: z.string().nonempty(t('messages.errors.required')),
            amount: amountSchema({
                requiredError: t('messages.errors.required'),
                invalidTypeError: t('messages.errors.pattern')
            }),
            from: z.string().nonempty(t('messages.errors.required')),
            to: z.string().nonempty(t('messages.errors.required')),
            note: z.string(),
            ignore: z.boolean()
        })
        .refine(data => data.from !== data.to, {
            message: t('messages.errors.bankAccountMismatch'),
            path: ['from']
        })

    const { form, handleSubmit, bankAccountCacheList } = useTransactionForm({
        initialData,
        action: TransactionAction.INTERNAL,
        onSubmit,
        customSchema: transferSchema
    })

    // Switch bank accounts functionality
    const switchBankAccount = useCallback(() => {
        const fromBankAccount = form.getValues('from')
        const toBankAccount = form.getValues('to')

        form.setValue('from', toBankAccount, { shouldValidate: false })
        form.setValue('to', fromBankAccount, { shouldValidate: false })
    }, [form])

    return {
        form,
        handleSubmit,
        switchBankAccount,
        bankAccountCacheList
    }
}
