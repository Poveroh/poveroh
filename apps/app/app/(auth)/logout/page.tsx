'use client'

import { AuthService } from '@/services/auth.service'
import { useEffect } from 'react'

const authService = new AuthService()

export default function LogoutPage() {
    useEffect(() => {
        authService.logout()
    }, [])

    return <></>
}
