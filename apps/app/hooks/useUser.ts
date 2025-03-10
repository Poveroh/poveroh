'use client'

import AppContext from '@/context/appContext'
import { useContext } from 'react'

export const useUser = () => {
    const context = useContext(AppContext)

    if (!context) {
        throw new Error('useUser must be used within a AppContextProvider')
    }

    return context
}
