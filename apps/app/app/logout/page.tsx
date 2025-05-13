'use client'

import { useAuth } from '@/hooks/userAuth'
import { useEffect } from 'react'

export default function LogoutPage() {
    const { logout } = useAuth()

    useEffect(() => {
        logout(true)
    }, [])

    return <></>
}
