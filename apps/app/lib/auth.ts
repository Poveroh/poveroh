import appConfig from '@/config'
import { createAuthClient } from 'better-auth/react'
import type { UserSession } from '@poveroh/types/contracts'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: appConfig.apiUrl + '/auth',
    fetchOptions: {
        credentials: 'include'
    }
})

export const getSession = async () => {
    const result = await authClient.getSession()
    return result as typeof result & {
        data: UserSession | null
    }
}
