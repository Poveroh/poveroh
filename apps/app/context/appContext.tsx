'use client'

import { useUser } from '@/hooks/useUser'
import { UserService } from '@/services/user.service'
import { createContext, useEffect } from 'react'

const AppContext = createContext({})

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const userService = new UserService()
    const { isAuthenticate, setUser, logged } = useUser()

    useEffect(() => {
        if (isAuthenticate()) {
            userService.me(true).then(readedUser => {
                setUser(readedUser)
            })
        }
    }, [logged])

    const context = {}

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
