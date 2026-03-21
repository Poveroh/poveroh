'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import the configured API client to ensure it's initialized
import '@/lib/api-client'

type ServerProviderProps = {
    children: React.ReactNode
}

export function ServerProvider({ children }: ServerProviderProps) {
    const queryClient = new QueryClient()

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
