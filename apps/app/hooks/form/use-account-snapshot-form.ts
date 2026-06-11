'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
    CreateFinancialAccountBalanceRequest,
    FinancialAccountBalanceData,
    FinancialAccountBalanceForm
} from '@poveroh/types'

import { useError } from '@/hooks/use-error'
import { FinancialAccountBalanceFormSchema } from '@poveroh/schemas'
import { logger } from '@poveroh/logger/browser'

/**
 * Manages the manual account balance form state, validation and submission.
 * @param accountId The financial account the balance entry belongs to.
 * @param initialData Existing balance point to prefill the form, or null when creating.
 * @returns The form instance, loading flag and submit handler.
 */
export const useAccountSnapshotForm = (accountId: string, initialData: FinancialAccountBalanceData | null) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const defaultValues: FinancialAccountBalanceForm = {
        financialAccountId: accountId,
        balance: initialData?.balance ?? 0,
        date: new Date().toISOString().split('T')[0]!,
        note: null
    }

    const form = useForm<FinancialAccountBalanceForm>({
        resolver: zodResolver(FinancialAccountBalanceFormSchema),
        defaultValues
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    /**
     * Validates the form, normalizes the date-only input to an ISO datetime and forwards the payload to the caller.
     * @param values The validated form values.
     * @param dataCallback Receives the create request payload to persist the balance entry.
     */
    const handleSubmit = async (
        values: FinancialAccountBalanceForm,
        dataCallback: (payload: CreateFinancialAccountBalanceRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const payload: CreateFinancialAccountBalanceRequest = {
                financialAccountId: values.financialAccountId,
                balance: values.balance,
                date: new Date(values.date).toISOString(),
                note: values.note ?? null
            }

            await dataCallback(payload, [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        loading,
        handleSubmit
    }
}
