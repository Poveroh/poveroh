'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { IUser } from '@poveroh/types'
import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'

export const usePreferencesForm = () => {
    const t = useTranslations()

    const { user, saveUser } = useUser()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        preferredCurrency: z.string().nonempty(t('messages.errors.required')),
        preferredLanguage: z.string().nonempty(t('messages.errors.required')),
        dateFormat: z.string().nonempty(t('messages.errors.required')),
        timezone: z.string().nonempty(t('messages.errors.required'))
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            preferredCurrency: user?.preferredCurrency || 'EUR',
            preferredLanguage: user?.preferredLanguage || 'en',
            dateFormat: user?.dateFormat || 'DD_MM_YYYY',
            timezone: user?.timezone || 'ETC_UTC'
        }
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                preferredCurrency: user?.preferredCurrency || 'EUR',
                preferredLanguage: user?.preferredLanguage || 'en',
                dateFormat: user?.dateFormat || 'DD_MM_YYYY',
                timezone: user?.timezone || 'ETC_UTC'
            })
            console.log('Form reset with user data')
        }
    }, [user])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const res = await saveUser(values as Partial<IUser>)

            if (res) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }

        setLoading(false)
    }

    return {
        form,
        user,
        loading,
        handleSubmit
    }
}
