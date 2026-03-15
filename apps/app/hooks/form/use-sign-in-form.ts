import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { UserLoginSchema } from '@poveroh/schemas'
import { useAuth } from '@/hooks/use-auth'
import { UserLogin } from '@poveroh/types/contracts'
import { useOnBoardingStepOrder } from '@/hooks/use-onboarding-step-order'

export function useSignInForm() {
    const router = useRouter()
    const { signIn } = useAuth()
    const { isAtLeast } = useOnBoardingStepOrder()

    const [loading, setLoading] = useState(false)

    const form = useForm<UserLogin>({
        resolver: zodResolver(UserLoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const handleSignIn = useCallback(
        async (user: UserLogin) => {
            setLoading(true)

            try {
                const res = await signIn(user)

                if (res) {
                    if (isAtLeast(res.onBoardingStep, 'PREFERENCES')) {
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
        [router, signIn, isAtLeast]
    )

    return {
        form,
        loading,
        handleSignIn
    }
}
