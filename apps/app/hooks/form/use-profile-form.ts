'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { IUser, IUserToSave } from '@poveroh/types'
import { useUser } from '@/hooks/use-user'
import { toast } from '@poveroh/ui/components/sonner'

export const useProfileForm = (initialData?: IUser) => {
    const t = useTranslations()

    const { user, saveUser } = useUser()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        name: z.string().nonempty(t('messages.errors.required')),
        surname: z.string().nonempty(t('messages.errors.required')),
        email: z.string().nonempty(t('messages.errors.required')).email(t('messages.errors.email'))
    })

    const defaultValues = initialData
        ? {
              name: initialData.name ?? '',
              surname: initialData.surname ?? '',
              email: initialData.email ?? ''
          }
        : {
              name: user?.name ?? '',
              surname: user?.surname ?? '',
              email: user?.email ?? ''
          }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        if (user && !form.formState.isDirty) {
            form.reset({
                name: user?.name ?? '',
                surname: user?.surname ?? '',
                email: user?.email ?? ''
            })
            console.log('Form reset with user data')
        }
    }, [user])

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const userToSave: IUserToSave = {
                name: values.name,
                surname: values.surname,
                email: values.email
            }

            const res = await saveUser({
                ...user,
                ...userToSave
            })

            if (res) {
                toast.success(t('form.messages.userSavedSuccess'))
                console.log('User profile updated successfully')
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
