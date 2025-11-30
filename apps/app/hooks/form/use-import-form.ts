'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { IImport } from '@poveroh/types'
import { useError } from '@/hooks/use-error'
import logger from '@/lib/logger'
import { useImport } from '../use-imports'

export function useImportForm(initialData?: IImport | null, inEditingMode?: boolean) {
    const t = useTranslations()

    const { handleError } = useError()
    const { parseTransactionFromFile } = useImport()

    const [files, setFiles] = useState<FileList | null>(null)
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        financialAccountId: z.string().nonempty(t('messages.errors.required'))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
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

            await parseTransactionFromFile(formData)
            setLoading(false)

            await dataCallback(formData)
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
