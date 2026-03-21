import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { useUserStore } from '@/store/auth.store'
import { OnBoardingStepEnum, UserLogin } from '@poveroh/types'
import { UserLoginSchema } from '@poveroh/schemas'

export function useSignUpForm() {
    const { signUp } = useAuth()
    const userStore = useUserStore()

    const [loading, setLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(UserLoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const handleSubmit = async (values: UserLogin) => {
        setLoading(true)

        const res = await signUp(values)

        if (res) {
            // After sign-up, set onboarding step to GENERALITIES
            userStore.setOnBoardingStep('GENERALITIES' as OnBoardingStepEnum)
            window.location.href = '/onboarding'
        }

        setLoading(false)
    }

    return {
        form,
        loading,
        handleSubmit
    }
}
