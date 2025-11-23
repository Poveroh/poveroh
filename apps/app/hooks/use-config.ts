'use client'

import { useUserStore } from '@/store/auth.store'

export const useConfig = () => {
    const userStore = useUserStore()

    return {
        preferedCurrency: userStore.user.preferredCurrency || 'EUR',
        preferedLanguage: userStore.user.preferredLanguage || 'en'
    }
}
