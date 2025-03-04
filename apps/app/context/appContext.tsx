'use client'

import { AuthService } from '@/services/auth.service'
import { UserService } from '@/services/user.service'
import { IUser } from '@poveroh/types/dist'
import { createContext, useEffect, useState } from 'react'

const userService = new UserService()
const authService = new AuthService()

const defaultUser: IUser = {
    id: '',
    name: '',
    surname: '',
    email: '',
    created_at: new Date()
}

type AppContextType = {
    user: IUser
    setUser: (newUser: IUser) => void
}

const initialContext: AppContextType = {
    user: defaultUser,
    setUser: (newUser: IUser) => {}
}

const AppContext = createContext<AppContextType>(initialContext)

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const [user, setUserState] = useState<IUser>(defaultUser)

    useEffect(() => {
        if (authService.isAuthenticate()) {
            userService.me(true).then(readedUser => {
                setUserState(readedUser)
            })
        }
    }, [])

    const setUser = (newUser: IUser) => {
        setUserState(newUser)
    }

    const context = { user, setUser }

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
