'use client'

import { useUser } from '@/hooks/use-user'
import { createContext, useEffect } from 'react'

const AppContext = createContext({})

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { me } = useUser()
    const context = {}

    useEffect(() => {
        async function fetchUser() {
            await me()
        }
        fetchUser()
    }, [])

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
