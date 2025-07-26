import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as z from 'zod'

import { IUserLogin } from '@poveroh/types'
import { useAuth } from '@/hooks/use-auth'

export function useSignInForm() {
    const t = useTranslations()
    const router = useRouter()
    const { signIn } = useAuth()

    const [loading, setLoading] = useState(false)

    const loginSchema = useMemo(
        () =>
            z.object({
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
            }),
        [t]
    )

    const form = useForm<IUserLogin>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const handleSignIn = useCallback(
        async (user: IUserLogin) => {
            setLoading(true)

            try {
                const res = await signIn(user)

                if (res) {
                    router.push('/dashboard')
                }
            } catch (error) {
                console.error('Sign in error:', error)
            } finally {
                setLoading(false)
            }
        },
        [router, signIn]
    )

    return {
        form,
        loading,
        handleSignIn
    }
}
