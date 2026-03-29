import { AUTH_TOKEN_STORAGE_KEY } from '@poveroh/types'
import { storage } from './storage'

const canUseBrowserStorage = () => typeof window !== 'undefined'

export const authToken = {
    get: (): string | null => {
        if (!canUseBrowserStorage()) return null

        const token = storage.get(AUTH_TOKEN_STORAGE_KEY)
        return token && token.trim().length > 0 ? token : null
    },
    set: (token: string | null | undefined) => {
        if (!canUseBrowserStorage()) return

        if (!token || token.trim().length === 0) {
            storage.remove(AUTH_TOKEN_STORAGE_KEY)
            return
        }

        storage.set(AUTH_TOKEN_STORAGE_KEY, token)
    },
    clear: () => {
        if (!canUseBrowserStorage()) return
        storage.remove(AUTH_TOKEN_STORAGE_KEY)
    }
}
