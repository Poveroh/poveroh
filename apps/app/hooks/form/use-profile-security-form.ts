'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { UserProfileSecurityFormSchema } from '@poveroh/schemas'
import { UserProfileSecurityForm } from '@poveroh/types'

export const useProfileSecurityForm = () => {
    const t = useTranslations()
    const { updatePassword } = useUser()

    const [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(UserProfileSecurityFormSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })

    const handleSubmit = async (passwordToSave: UserProfileSecurityForm) => {
        setLoading(true)

        const res = await updatePassword(passwordToSave.oldPassword, passwordToSave.newPassword)

        if (res) {
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
