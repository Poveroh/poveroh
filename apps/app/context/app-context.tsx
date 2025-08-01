'use client'

import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { createContext, useEffect } from 'react'

const AppContext = createContext({})

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { me } = useUser()
    const { isAuthenticate, logged } = useAuth()

    useEffect(() => {
        async function fetchUser() {
            if (isAuthenticate()) {
                await me(true)
            }
        }

        fetchUser()
    }, [logged])

    const context = {}

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
