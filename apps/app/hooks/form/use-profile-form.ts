'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'
import { UserProfileFormSchema } from '@poveroh/schemas'
import { UserProfileForm } from '@poveroh/types'

export const useProfileForm = () => {
    const t = useTranslations()

    const { user, updateUser } = useUser()

    const form = useForm({
        resolver: zodResolver(UserProfileFormSchema),
        defaultValues: {
            name: user?.name ?? '',
            surname: user?.surname ?? '',
            email: user?.email ?? '',
            country: user?.country ?? ''
        }
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                name: user?.name ?? '',
                surname: user?.surname ?? '',
                email: user?.email ?? '',
                country: user?.country ?? ''
            })
            console.log('Form reset with user data')
        }
    }, [user, form])

    const handleSubmit = async (values: UserProfileForm) => {
        if (updateUser.isPending) return

        try {
            const res = await updateUser.mutateAsync({
                body: values
            })

            if (res) {
                toast.success(t('form.messages.userSavedSuccess'))
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    return {
        form,
        user,
        loading: updateUser.isPending,
        handleSubmit
    }
}
