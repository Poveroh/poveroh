'use client'

import { createContext } from 'react'

const AppContext = createContext({})

type AppContextProviderProps = {
    children: React.ReactNode
}

export function AppContextProvider({ children }: AppContextProviderProps) {
    const context = {}

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
}

export default AppContext
