import isEmpty from 'lodash/isEmpty'
import Cookies from 'js-cookie'

export const storage = {
    set: (key: string, value: object | string | boolean): void => {
        if (typeof window === 'undefined' || !key || value === undefined) return

        const tempValue =
            typeof value === 'string' || typeof value === 'boolean'
                ? value.toString()
                : isEmpty(value)
                  ? undefined
                  : JSON.stringify(value)

        if (tempValue) window.localStorage.setItem(key, tempValue)
    },

    get: (key: string): string | null => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined' || !key) return
        window.localStorage.removeItem(key)
    },

    clear: (): void => {
        window.localStorage.clear()
    },

    parse<T>(key: string): T {
        return JSON.parse(<string>this.get(key)) as T
    }
}

export const cookie = {
    set: (
        key: string,
        value: object | string | boolean,
        options?: Cookies.CookieAttributes
    ): void => {
        if (typeof document === 'undefined' || !key || value === undefined) return

        const tempValue =
            typeof value === 'string' || typeof value === 'boolean'
                ? value.toString()
                : JSON.stringify(value)

        Cookies.set(key, tempValue, options)
    },

    get: (key: string): string | undefined => {
        if (typeof document === 'undefined') return undefined
        return Cookies.get(key)
    },

    has(key: string) {
        return !isEmpty(this.get(key))
    },

    remove: (key: string, options?: Cookies.CookieAttributes): void => {
        if (typeof document === 'undefined' || !key) return
        Cookies.remove(key, options)
    },

    parse<T>(key: string): T | null {
        try {
            const value = this.get(key)
            return value ? (JSON.parse(value) as T) : null
        } catch (error) {
            return null
        }
    }
}
