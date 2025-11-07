import { createAuthClient } from 'better-auth/react'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
    basePath: '/api/v1/auth',
    fetchOptions: {
        credentials: 'include'
    }
})
