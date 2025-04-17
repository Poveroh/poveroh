'use client'

import CacheContext from '@/context/cacheContext'
import { useContext } from 'react'

export const useCache = () => {
    const context = useContext(CacheContext)

    if (!context) {
        throw new Error('useCache must be used within a CacheContextProvider')
    }

    return context
}
