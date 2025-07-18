import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { IImport } from '@poveroh/types'
import { useBankAccount } from '@/hooks/useBankAccount'
import { useError } from '@/hooks/useError'
import { useImport } from '@/hooks/useImports'
import logger from '@/lib/logger'

type UseBankAccountAndFileFormProps = {
    initialData?: IImport
    onSuccess: (importedFiles: IImport) => void
}

export function useBankAccountAndFileForm({ initialData, onSuccess }: UseBankAccountAndFileFormProps) {
    const t = useTranslations()

    const { handleError } = useError()
    const { parseTransactionFromFile } = useImport()
    const { bankAccountCacheList, fetchBankAccount } = useBankAccount()

    const [loading, setLoading] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const [files, setFiles] = useState<File[] | null>(null)
    const [fileError, setFileError] = useState(false)

    const formSchema = z.object({
        bankAccountId: z.string().nonempty(t('messages.errors.required'))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bankAccountId: initialData?.bankAccountId || ''
        }
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('bankAccountId', values.bankAccountId)

            files?.forEach(file => {
                formData.append('files', file)
            })

            const readedParsedTransaction = await parseTransactionFromFile(formData)
            setLoading(false)
            setShowButton(false)

            onSuccess(readedParsedTransaction)
        } catch (error) {
            setLoading(false)
            handleError(error, 'Form error')
        }
    }

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || [])
            const existingFiles = files || []

            const newFiles = selectedFiles.filter(
                file =>
                    !existingFiles.some(
                        f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
                    )
            )

            if (newFiles.length > 0) {
                setFiles([...existingFiles, ...newFiles])
                setShowButton(true)
            }

            if (selectedFiles.length > 0) {
                setFileError(false)
            }
        },
        [files]
    )

    const removeFile = useCallback(
        (index: number) => {
            const newFiles = files?.filter((_, i) => i !== index) || []
            setFiles(newFiles.length > 0 ? newFiles : null)
            if (newFiles.length === 0) {
                setShowButton(false)
            }
        },
        [files]
    )

    const onBankAccountOpenChange = useCallback(
        async (open: boolean) => {
            if (open) {
                await fetchBankAccount()
                form.setValue('bankAccountId', initialData?.bankAccountId || form.getValues('bankAccountId') || '')
            }
        },
        [fetchBankAccount, form, initialData?.bankAccountId]
    )

    return {
        form,
        loading,
        showButton,
        files,
        fileError,
        bankAccountCacheList,
        handleSubmit,
        handleFileChange,
        removeFile,
        onBankAccountOpenChange
    }
}
