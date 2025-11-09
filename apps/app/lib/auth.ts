import appConfig from '@/config'
import { createAuthClient } from 'better-auth/react'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: appConfig.apiUrl + '/auth',
    fetchOptions: {
        credentials: 'include'
    }
})
