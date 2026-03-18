'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FinancialAccountData, FinancialAccountForm } from '@poveroh/types/contracts'

import { useError } from '@/hooks/use-error'
import { FinancialAccountFormSchema } from '@poveroh/schemas'

export const useFinancialAccountForm = (initialData: FinancialAccountData | null, inEditingMode: boolean) => {
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const defaultValues = initialData || {
        title: '',
        description: '',
        type: 'BANK_ACCOUNT'
    }

    const form = useForm<FinancialAccountForm>({
        resolver: zodResolver(FinancialAccountFormSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: FinancialAccountForm,
        dataCallback: (formData: Partial<FinancialAccountForm>, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const payload = inEditingMode ? { ...initialData, ...values } : values

            await dataCallback(payload, file ? Array.from(file) : [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        file,
        loading,
        setFile,
        handleSubmit
    }
}
