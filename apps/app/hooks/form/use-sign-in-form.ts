import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { IUserLogin, OnBoardingStep } from '@poveroh/types'
import { UserLoginSchema } from '@poveroh/schemas'
import { useAuth } from '@/hooks/use-auth'

export function useSignInForm() {
    const router = useRouter()
    const { signIn } = useAuth()

    const [loading, setLoading] = useState(false)

    const form = useForm<IUserLogin>({
        resolver: zodResolver(UserLoginSchema),
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
                    if (res.onBoardingStep >= OnBoardingStep.PREFERENCES) {
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
        [router, signIn]
    )

    return {
        form,
        loading,
        handleSignIn
    }
}
