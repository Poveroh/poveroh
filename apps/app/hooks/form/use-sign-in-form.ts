import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as z from 'zod'

import { IUserLogin, OnBoardingStep } from '@poveroh/types'
import { useAuth } from '@/hooks/use-auth'
import { useUserStore } from '@/store/auth.store'

export function useSignInForm() {
    const t = useTranslations()
    const router = useRouter()
    const { signIn } = useAuth()
    const userStore = useUserStore()

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
                    if (userStore.user.onBoardingStep >= OnBoardingStep.PREFERENCES) {
                        router.push('/dashboard')
                    } else {
                        router.push('/onboarding')
                    }
                }
            } catch (error) {
                console.error('Sign in error:', error)
            } finally {
                setLoading(false)
            }
        },
        [router, signIn, userStore.user]
    )

    return {
        form,
        loading,
        handleSignIn
    }
}
