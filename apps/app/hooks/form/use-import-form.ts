'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import logger from '@/lib/logger'
import { ImportForm } from '@poveroh/types'
import { ImportFormSchema } from '@poveroh/schemas'
import { ImportFormProps } from '@/types'
import { useError } from '../use-error'

export function useImportForm(props: ImportFormProps) {
    const { handleError } = useError()

    const [files, setFiles] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    const form = useForm<ImportForm>({
        resolver: zodResolver(ImportFormSchema),
        defaultValues: {
            financialAccountId: props.initialData?.financialAccountId || ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: ImportForm,
        dataCallback: (formData: ImportForm, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            await dataCallback(values, files)
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = form.handleSubmit(
        values => handleSubmit(values, props.dataCallback),
        errors => {
            logger.error('Form validation errors on submit:', errors)
        }
    )

    return {
        form,
        files,
        loading,
        setFiles,
        onSubmit
    }
}
