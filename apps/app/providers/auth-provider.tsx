'use client'

import { useUser } from '@/hooks/use-user'
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
    isInitialized: boolean
}

const AuthContext = createContext<AuthContextType>({
    isInitialized: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false)
    const { me } = useUser()

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await me()
            } catch (error) {
                console.error('Failed to initialize auth:', error)
            } finally {
                setIsInitialized(true)
            }
        }

        initializeAuth()
    }, [])

    // Don't render children until auth is initialized
    if (!isInitialized) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            </div>
        )
    }

    return <AuthContext.Provider value={{ isInitialized }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
