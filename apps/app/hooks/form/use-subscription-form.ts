'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useError } from '@/hooks/use-error'
import { iconList } from '@/components/icon'
import {
    SubscriptionData,
    SubscriptionForm,
    DEFAULT_SUBSCRIPTION,
    CreateUpdateSubscriptionRequest
} from '@poveroh/types'
import { SubscriptionFormSchema } from '@poveroh/schemas'

export const useSubscriptionForm = (initialData: SubscriptionData | null) => {
    const t = useTranslations()
    const { handleError } = useError()

    const [icon, setIcon] = useState(iconList[0])
    const [file, setFile] = useState<File[]>([])
    const [loading, setLoading] = useState(false)

    const formSchema = SubscriptionFormSchema.refine(
        data => {
            if (data.appearanceMode === 'LOGO') {
                return z.string().safeParse(data.appearanceLogoIcon).success
            }
            return true
        },
        {
            message: t('messages.errors.url'),
            path: ['appearanceLogoIcon']
        }
    )

    const form = useForm<SubscriptionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || DEFAULT_SUBSCRIPTION
    })

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            console.debug('Form errors:', form.formState.errors)
            console.debug('Form values:', form.getValues())
        }
    }, [form.formState.errors])

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
            if (initialData.appearanceLogoIcon) {
                setIcon(initialData.appearanceLogoIcon)
            }
        }
    }, [initialData])

    const handleSubmit = async (
        values: SubscriptionForm,
        dataCallback: (payload: CreateUpdateSubscriptionRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            console.log('[subscription submit]', values)

            values.firstPayment = new Date(values.firstPayment).toISOString()

            await dataCallback(values, file ? Array.from(file) : [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const handleIconChange = (newIcon: string) => {
        form.setValue('appearanceLogoIcon', newIcon)
        setIcon(newIcon)
    }

    const handleFileChange = (newFile: File[]) => {
        setFile(newFile)
    }

    return {
        form,
        icon,
        file,
        loading,
        handleSubmit,
        handleIconChange,
        handleFileChange
    }
}
