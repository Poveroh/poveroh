'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { ICategory } from '@poveroh/types'
import { iconList } from '@/components/icon'
import { useError } from '@/hooks/use-error'
import { useTransaction } from '@/hooks/use-transaction'

export const useCategoryForm = (initialData?: ICategory | null, inEditingMode: boolean = false) => {
    const t = useTranslations()

    const { handleError } = useError()
    const { getActionList } = useTransaction()

    const [icon, setIcon] = useState(iconList[0])
    const [loading, setLoading] = useState(false)

    const defaultValues = {
        title: '',
        description: '',
        logoIcon: iconList[0] as string,
        for: initialData?.for || 'EXPENSES'
    }

    const formSchema = z.object({
        title: z.string().nonempty(t('messages.errors.required')),
        description: z
            .string()
            .optional()
            .nullable()
            .transform(val => val || ''),
        logoIcon: z.string().nonempty(t('messages.errors.required')),
        for: z.string()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                description: initialData.description || ''
            })
            setIcon(initialData.logoIcon)
        }
    }, [initialData, form])

    const handleSubmit = async (
        values: z.infer<typeof formSchema>,
        dataCallback: (formData: FormData) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const formData = new FormData()
            formData.append('data', JSON.stringify(inEditingMode ? { ...initialData, ...values } : values))

            await dataCallback(formData)
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const handleIconChange = (iconName: string) => {
        form.setValue('logoIcon', iconName)
        setIcon(iconName)
    }

    return {
        form,
        icon,
        loading,
        setLoading,
        handleSubmit,
        handleIconChange,
        actionList: getActionList(true)
    }
}
