import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'

export function useSignUpForm() {
    const t = useTranslations()
    const { signUp } = useAuth()

    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        name: z.string().nonempty(t('messages.errors.required')),
        surname: z.string().nonempty(t('messages.errors.required')),
        email: z.string().nonempty(t('messages.errors.required')).email(t('messages.errors.email')),
        password: z
            .string()
            .nonempty(t('messages.errors.required'))
            .min(
                6,
                t('messages.errors.passwordAtLeastChar', {
                    a: 6
                })
            )
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            surname: '',
            email: '',
            password: ''
        }
    })

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        const res = await signUp(values)

        if (res) {
            window.location.href = '/dashboard'
        }

        setLoading(false)
    }

    return {
        form,
        loading,
        handleSubmit
    }
}
