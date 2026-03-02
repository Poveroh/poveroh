import { AUTH_TOKEN_STORAGE_KEY } from '@poveroh/types'

const canUseBrowserStorage = () => typeof window !== 'undefined'

export const authToken = {
    get: (): string | null => {
        if (!canUseBrowserStorage()) return null

        const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
        return token && token.trim().length > 0 ? token : null
    },
    set: (token: string | null | undefined) => {
        if (!canUseBrowserStorage()) return

        if (!token || token.trim().length === 0) {
            window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
            return
        }

        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    },
    clear: () => {
        if (!canUseBrowserStorage()) return
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    }
}
