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
    logged: boolean
    setUser: (newUser: IUser) => void
    setLogged: (newLoggedState: boolean) => void
}

const initialContext: AppContextType = {
    user: defaultUser,
    logged: false,
    setUser: (newUser: IUser) => {},
    setLogged: (newLoggedState: boolean) => {}
}

const AppContext = createContext<AppContextType>(initialContext)

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const [user, setUserState] = useState<IUser>(defaultUser)
    const [logged, setLoggedState] = useState(false)

    useEffect(() => {
        if (authService.isAuthenticate()) {
            userService.me(true).then(readedUser => {
                setUserState(readedUser)
            })
        }
    }, [logged])

    const setUser = (newUser: IUser) => {
        setUserState(newUser)
    }

    const setLogged = (newLoggedState: boolean) => {
        setLoggedState(newLoggedState)
    }

    const context = { user, setUser, logged, setLogged }

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
