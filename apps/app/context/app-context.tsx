'use client'

import { useUser } from '@/hooks/use-user'
import { createContext } from 'react'
import useSWR from 'swr'

const AppContext = createContext({})

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const { me } = useUser()
    const context = {}

    useSWR('auth/me', me)

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
