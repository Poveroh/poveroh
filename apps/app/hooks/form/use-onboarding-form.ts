import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from '@/store/auth.store'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { UserFormGeneralitiesFormSchema, UserFormPreferencesFormSchema } from '@poveroh/schemas'
import { UserFormGeneralitiesForm, UserFormPreferencesForm } from '@poveroh/types'

export function useOnBoardingForm() {
    const userStore = useUserStore()
    const { updateUser } = useUser()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const formGeneralities = useForm({
        resolver: zodResolver(UserFormGeneralitiesFormSchema),
        defaultValues: {
            name: userStore.user.name || '',
            surname: userStore.user.surname || '',
            country: userStore.user.country || 'italy'
        }
    })

    const formPreferences = useForm({
        resolver: zodResolver(UserFormPreferencesFormSchema),
        defaultValues: {
            preferredCurrency: userStore.user.preferredCurrency || 'EUR',
            preferredLanguage: userStore.user.preferredLanguage || 'en',
            dateFormat: userStore.user.dateFormat || 'DD_MM_YYYY',
            timezone: userStore.user.timezone || 'ETC_UTC'
        }
    })

    const handleGeneralitiesSubmit = async (values: UserFormGeneralitiesForm) => {
        setLoading(true)

        try {
            await updateUser.mutateAsync({
                body: {
                    name: values.name,
                    surname: values.surname,
                    email: userStore.user.email,
                    onBoardingStep: 'PREFERENCES',
                    country: values.country
                }
            })

            router.push('/onboarding/preferences')
        } finally {
            setLoading(false)
        }
    }

    const handlePreferencesSubmit = async (values: UserFormPreferencesForm) => {
        if (updateUser.isPending) return

        try {
            await updateUser.mutateAsync({
                body: {
                    onBoardingStep: 'COMPLETED',
                    preferredCurrency: values.preferredCurrency,
                    preferredLanguage: values.preferredLanguage,
                    dateFormat: values.dateFormat
                }
            })

            router.push('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    return {
        formGeneralities,
        formPreferences,
        loading: updateUser.isPending,
        handleGeneralitiesSubmit,
        handlePreferencesSubmit
    }
}
