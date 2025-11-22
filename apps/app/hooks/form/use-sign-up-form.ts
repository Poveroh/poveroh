import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { useUserStore } from '@/store/auth.store'
import { OnBoardingStep } from '@poveroh/types'
import * as z from 'zod'

export function useSignUpForm() {
    const t = useTranslations()
    const { signUp } = useAuth()
    const userStore = useUserStore()

    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
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
            email: '',
            password: ''
        }
    })

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        const res = await signUp(values)

        if (res) {
            // After sign-up, set onboarding step to GENERALITIES
            userStore.setOnBoardingStep(OnBoardingStep.GENERALITIES)
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
