'use client'

import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'

export default function LogoutPage() {
    const { logout } = useAuthStore()

    useEffect(() => {
        logout(true)
    }, [])

    return <></>
}
