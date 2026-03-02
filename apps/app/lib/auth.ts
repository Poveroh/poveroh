import appConfig from '@/config'
import { createAuthClient } from 'better-auth/react'
import type { UserSession } from '@poveroh/types/contracts'
import { authToken } from './auth-token'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    baseURL: appConfig.apiUrl + '/auth',
    fetchOptions: {
        credentials: 'include',
        auth: {
            type: 'Bearer',
            token: () => authToken.get() ?? undefined
        },
        onSuccess: context => {
            const nextToken = context.response.headers.get('set-auth-token')
            if (nextToken) {
                authToken.set(nextToken)
            }
        }
    }
})

export const getSession = async () => {
    const result = await authClient.getSession()
    return result as typeof result & {
        data: UserSession | null
    }
}
