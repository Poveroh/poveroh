'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import logger from '@/lib/logger'
import { ImportForm } from '@poveroh/types'
import { ImportFormSchema } from '@poveroh/schemas'
import { ImportFormProps } from '@/types'
import { useError } from '../use-error'

export function useImportForm(props: ImportFormProps) {
    const { handleError } = useError()
    const t = useTranslations()

    const [files, setFiles] = useState<File[]>([])
    const [fileError, setFileError] = useState<string | undefined>(undefined)
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

    // Clear the inline file error as soon as the user picks at least one file
    const handleSetFiles = (next: File[]) => {
        setFiles(next)
        if (next.length > 0) setFileError(undefined)
    }

    const handleSubmit = async (
        values: ImportForm,
        dataCallback: (formData: ImportForm, files: File[]) => Promise<void>
    ) => {
        try {
            if (files.length === 0) {
                setFileError(t('messages.errors.required'))
                return
            }

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
            if (files.length === 0) setFileError(t('messages.errors.required'))
            if (Object.keys(errors).length > 0) {
                logger.error('Form validation errors on submit:', errors)
            }
        }
    )

    return {
        form,
        files,
        fileError,
        loading,
        setFiles: handleSetFiles,
        onSubmit
    }
}
