import { createAuthClient } from 'better-auth/react'
import appConfig from '@/config'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: appConfig.apiUrl + '/auth',
    credentials: 'include' as const
})
