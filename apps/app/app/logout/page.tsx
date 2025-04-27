'use client'

import { useUser } from '@/hooks/useUser'
import { useEffect } from 'react'

export default function LogoutPage() {
    const { logout } = useUser()

    useEffect(() => {
        logout(true)
    }, [])

    return <></>
}
