import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserStore } from '@/store/auth.store'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { UserFormGeneralitiesFormSchema, UserFormPreferencesFormSchema } from '@poveroh/schemas'
import { DEFAULT_USER_PREFERENCES, UserFormGeneralitiesForm, UserFormPreferencesForm } from '@poveroh/types'

export function useOnBoardingForm() {
    const userStore = useUserStore()
    const { updateUser, updatePreferences } = useUser()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const preferences = userStore.user.preferences ?? DEFAULT_USER_PREFERENCES

    const formGeneralities = useForm({
        resolver: zodResolver(UserFormGeneralitiesFormSchema),
        defaultValues: {
            name: userStore.user.name || '',
            surname: userStore.user.surname || '',
            country: preferences.country || 'ITALY'
        }
    })

    const formPreferences = useForm({
        resolver: zodResolver(UserFormPreferencesFormSchema),
        defaultValues: {
            preferredCurrency: preferences.preferredCurrency || 'EUR',
            preferredLanguage: preferences.preferredLanguage || 'EN',
            dateFormat: preferences.dateFormat || 'DD_MM_YYYY',
            timezone: preferences.timezone || 'ETC_UTC'
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
                    onBoardingStep: 'PREFERENCES'
                }
            })

            await updatePreferences.mutateAsync({
                body: {
                    country: values.country
                }
            })

            router.push('/onboarding/preferences')
        } finally {
            setLoading(false)
        }
    }

    const handlePreferencesSubmit = async (values: UserFormPreferencesForm) => {
        if (updateUser.isPending || updatePreferences.isPending) return

        try {
            await updateUser.mutateAsync({
                body: {
                    onBoardingStep: 'COMPLETED'
                }
            })

            await updatePreferences.mutateAsync({
                body: {
                    preferredCurrency: values.preferredCurrency,
                    preferredLanguage: values.preferredLanguage,
                    dateFormat: values.dateFormat,
                    timezone: values.timezone
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
        loading: updateUser.isPending || updatePreferences.isPending,
        handleGeneralitiesSubmit,
        handlePreferencesSubmit
    }
}
