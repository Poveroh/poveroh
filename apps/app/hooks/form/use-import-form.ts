'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import logger from '@/lib/logger'
import { useImport } from '../use-imports'
import { CreateImportRequest, ImportData } from '@poveroh/types'
import { ImportDataSchema } from '@poveroh/schemas'

export function useImportForm(initialData: ImportData | null) {
    const { handleError } = useError()
    const { createImportFromFile } = useImport()

    const [files, setFiles] = useState<File[] | null>(null)
    const [loading, setLoading] = useState(false)

    const form = useForm<ImportData>({
        resolver: zodResolver(ImportDataSchema),
        defaultValues: {
            financialAccountId: initialData?.financialAccountId || ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleParseForm = async (
        values: ImportData,
        dataCallback: (formData: CreateImportRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const formData = new FormData()

            formData.append('financialAccountId', values.financialAccountId)

            if (files) {
                Array.from(files).forEach(file => {
                    formData.append('files', file)
                })
            }

            await createImportFromFile(formData)
            setLoading(false)

            await dataCallback(values, files ? Array.from(files) : [])
        } catch (error) {
            setLoading(false)
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        files,
        loading,
        setFiles,
        handleParseForm
    }
}
