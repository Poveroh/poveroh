'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { BankAccountType, IBankAccount } from '@poveroh/types'

import { useError } from '@/hooks/use-error'

type UseBankAccountFormProps = {
    initialData?: IBankAccount | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
}

export const useBankAccountForm = ({ initialData, inEditingMode, dataCallback }: UseBankAccountFormProps) => {
    const t = useTranslations()
    const { handleError } = useError()

    const [file, setFile] = useState<FileList | null>(null)

    const defaultValues = initialData || {
        title: '',
        description: '',
        type: BankAccountType.BANK_ACCOUNT
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z.string(),
        type: z.enum(Object.values(BankAccountType) as [BankAccountType, ...BankAccountType[]])
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData()

            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            if (file && file[0]) {
                formData.append('file', file[0])
            }

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        }
    }

    const submitForm = () => {
        form.handleSubmit(handleSubmit)()
    }

    return {
        form,
        file,
        setFile,
        handleSubmit,
        submitForm,
        formSchema
    }
}
