'use client'

import { SWRConfig } from 'swr'

type SwrProviderProps = {
    children: React.ReactNode
}

export function SwrProvider({ children }: SwrProviderProps) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                shouldRetryOnError: false
            }}
        >
            {children}
        </SWRConfig>
    )
}
