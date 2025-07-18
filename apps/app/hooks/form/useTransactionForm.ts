import { useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useError } from '@/hooks/useError'
import { useCategory } from '@/hooks/useCategory'
import { useBankAccount } from '@/hooks/useBankAccount'
import { ISubcategory, ITransaction, TransactionAction } from '@poveroh/types'
import logger from '@/lib/logger'
import { amountSchema } from '@/types/form'

type UseTransactionFormProps = {
    initialData?: ITransaction
    action: TransactionAction
    onSubmit: (formData: FormData) => Promise<void>
    customSchema?: z.ZodSchema<ITransaction>
}

export function useTransactionForm({ initialData, action, onSubmit, customSchema }: UseTransactionFormProps) {
    const t = useTranslations()
    const { handleError } = useError()
    const { categoryCacheList } = useCategory()
    const { bankAccountCacheList } = useBankAccount()

    const [subcategoryList, setSubcategoryList] = useState<ISubcategory[]>([])
    const [file, setFile] = useState<FileList | null>(null)
    const [fileError, setFileError] = useState(false)

    // Base schema for common transaction fields
    const baseSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        date: z.string({
            required_error: t('messages.errors.required')
        }),
        amount: amountSchema({
            requiredError: t('messages.errors.required'),
            invalidTypeError: t('messages.errors.pattern')
        }),
        currency: z.string().nonempty(t('messages.errors.required')),
        note: z.string(),
        ignore: z.boolean()
    })

    // Use custom schema or extend base schema
    const formSchema = customSchema || baseSchema

    const defaultValues = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'EUR',
        note: '',
        ignore: false
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || defaultValues
    })

    // Handle subcategory parsing when category changes
    const parseSubcategoryList = useCallback(
        async (categoryId: string) => {
            const category = categoryCacheList.find(item => item.id === categoryId)
            const res = category ? category.subcategories : []
            setSubcategoryList(res)
        },
        [categoryCacheList]
    )

    // Handle form submission
    const handleSubmit = useCallback(
        async (values: TransactionFormData) => {
            try {
                const formData = new FormData()

                const dataToSubmit = initialData ? { ...initialData, ...values } : values

                formData.append('data', JSON.stringify(dataToSubmit))
                formData.append('action', action)

                if (file && file[0]) {
                    formData.append('file', file[0])
                }

                await onSubmit(formData)
            } catch (error) {
                handleError(error, 'Form submission error')
            }
        },
        [initialData, action, file, onSubmit, handleError]
    )

    // Update form when initial data changes
    useEffect(() => {
        if (initialData) {
            const resetData = {
                ...initialData,
                amount: initialData.amounts?.[0]?.amount || initialData.amount || 0
            }
            form.reset(resetData)
        }
    }, [initialData, form])

    // Log form errors for debugging
    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    return {
        form,
        subcategoryList,
        setSubcategoryList,
        parseSubcategoryList,
        file,
        setFile,
        fileError,
        setFileError,
        handleSubmit,
        categoryCacheList,
        bankAccountCacheList,
        t
    }
}
