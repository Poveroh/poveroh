'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { IPasswordToChange } from '@poveroh/types'
import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { authClient } from '@/lib/auth'

export const useProfileSecurityForm = () => {
    const t = useTranslations()
    const { updatePassword } = useUser()

    const [loading, setLoading] = useState(false)

    const objectSetup = z
        .string()
        .nonempty(t('messages.errors.required'))
        .min(
            6,
            t('messages.errors.passwordAtLeastChar', {
                a: 6
            })
        )

    const formSchema = z
        .object({
            oldPassword: objectSetup,
            newPassword: objectSetup,
            confirmPassword: objectSetup
        })
        .refine(data => data.newPassword === data.confirmPassword, {
            message: t('messages.errors.passwordMismatch'),
            path: ['confirmPassword']
        })
        .refine(data => data.oldPassword !== data.newPassword, {
            message: t('messages.errors.passwordMustBeDifferent'),
            path: ['newPassword']
        })

    const defaultValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = async (passwordToSave: IPasswordToChange) => {
        setLoading(true)

        const { data, error } = await authClient.changePassword({
            newPassword: passwordToSave.newPassword,
            currentPassword: passwordToSave.oldPassword,
            revokeOtherSessions: true
        })

        if (data && !error) {
            toast.success(t('form.messages.passwordSuccess'))
            form.reset()
        }

        setLoading(false)
    }

    return {
        form,
        loading,
        handleSubmit
    }
}
