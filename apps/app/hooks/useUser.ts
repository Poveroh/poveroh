'use client'

import { cookie, storage } from '@/lib/storage'
import { useUserStore } from '@/store/auth.store'
import { redirect } from 'next/navigation'

export const useUser = () => {
    const userStore = useUserStore()

    const logout = (redirectToLogin?: boolean) => {
        storage.clear()
        cookie.remove('token')
        userStore.resetAll()

        if (redirectToLogin) redirect('/sign-in')
    }

    const isAuthenticate = () => {
        return cookie.has('token')
    }

    return {
        ...userStore,
        logout,
        isAuthenticate
    }
}
