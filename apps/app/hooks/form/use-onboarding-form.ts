import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useUserStore } from '@/store/auth.store'
import { Currencies, DateFormat, Language, OnBoardingStep } from '@poveroh/types'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import * as z from 'zod'

export function useOnBoardingForm() {
    const t = useTranslations()
    const userStore = useUserStore()
    const { saveUser } = useUser()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const formGeneralitiesForm = z.object({
        name: z.string().nonempty(t('messages.errors.required')),
        surname: z.string().nonempty(t('messages.errors.required')),
        country: z.string().nonempty(t('messages.errors.required'))
    })

    const formPreferencesForm = z.object({
        preferredCurrency: z.string().nonempty(t('messages.errors.required')),
        preferredLanguage: z.string().nonempty(t('messages.errors.required')),
        dateFormat: z.string().nonempty(t('messages.errors.required'))
    })

    const formGeneralities = useForm({
        resolver: zodResolver(formGeneralitiesForm),
        defaultValues: {
            name: userStore.user.name || '',
            surname: userStore.user.surname || '',
            country: userStore.user.country || 'italy'
        }
    })

    const formPreferences = useForm({
        resolver: zodResolver(formPreferencesForm),
        defaultValues: {
            preferredCurrency: userStore.user.preferredCurrency || 'EUR',
            preferredLanguage: userStore.user.preferredLanguage || 'en',
            dateFormat: userStore.user.dateFormat || 'DD_MM_YYYY'
        }
    })

    const handleGeneralitiesSubmit = async (values: z.infer<typeof formGeneralitiesForm>) => {
        setLoading(true)

        await saveUser({
            name: values.name,
            surname: values.surname,
            email: userStore.user.email,
            onBoardingStep: OnBoardingStep.PREFERENCES,
            country: values.country
        })

        router.push('/onboarding/preferences')

        setLoading(false)
    }

    const handlePreferencesSubmit = async (values: z.infer<typeof formPreferencesForm>) => {
        setLoading(true)

        await saveUser({
            onBoardingStep: OnBoardingStep.COMPLETED,
            preferredCurrency: values.preferredCurrency as Currencies,
            preferredLanguage: values.preferredLanguage as Language,
            dateFormat: values.dateFormat as DateFormat
        })

        router.push('/dashboard')

        setLoading(false)
    }

    return {
        formGeneralities,
        formPreferences,
        loading,
        handleGeneralitiesSubmit,
        handlePreferencesSubmit
    }
}
