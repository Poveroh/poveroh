'use client'

import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { authClient } from '@/lib/auth'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

type AuthContextType = {
    isInitialized: boolean
}

const AuthContext = createContext<AuthContextType>({
    isInitialized: false
})

const SESSION_CHECK_INTERVAL = 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false)
    const { logout } = useAuth()
    const { me } = useUser()
    const logoutRef = useRef(logout)

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

    useEffect(() => {
        logoutRef.current = logout
    }, [logout])

    useEffect(() => {
        let isMounted = true
        let isLoggingOut = false

        const verifySession = async () => {
            if (!isMounted || isLoggingOut) {
                return
            }

            try {
                const result = await authClient.getSession()
                const hasSession = Boolean(result.data?.session)

                if (result.error || !hasSession) {
                    isLoggingOut = true
                    await logoutRef.current()
                }
            } catch (error) {
                console.error('Session validation failed:', error)
                if (!isLoggingOut) {
                    isLoggingOut = true
                    await logoutRef.current()
                }
            }
        }

        const intervalId = setInterval(verifySession, SESSION_CHECK_INTERVAL)
        verifySession() // catch stale sessions immediately

        return () => {
            isMounted = false
            clearInterval(intervalId)
        }
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
