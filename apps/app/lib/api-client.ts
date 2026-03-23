import { client } from '@/api/client.gen'
import appConfig from '@/config'
import { authToken } from '@/lib/auth-token'
import axios, { type AxiosRequestConfig } from 'axios'

const querySerializer = (params: Record<string, unknown>): string => {
    const parts: string[] = []

    const serialize = (value: unknown, prefix: string) => {
        if (value === undefined || value === null) return
        if (Array.isArray(value)) {
            value.forEach(item => serialize(item, `${prefix}[]`))
        } else if (typeof value === 'object') {
            Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
                serialize(val, `${prefix}[${key}]`)
            })
        } else {
            parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`)
        }
    }

    Object.entries(params).forEach(([key, value]) => serialize(value, key))
    return parts.join('&')
}

/**
 * Configure axios instance with authentication
 *
 * By default, all requests will include credentials (cookies) for better-auth authentication.
 * The session cookie is automatically sent with each request.
 */
const axiosInstance = axios.create({
    baseURL: appConfig.apiUrl + '/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

axiosInstance.interceptors.request.use(config => {
    const token = authToken.get()

    if (!token) return config

    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`

    return config
})

axiosInstance.interceptors.response.use(response => {
    const nextToken = response.headers['set-auth-token']
    if (typeof nextToken === 'string') {
        authToken.set(nextToken)
    }

    return response
})

client.setConfig({
    baseUrl: appConfig.apiUrl + '/v1',
    querySerializer,
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
        const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url

        const axiosConfig: AxiosRequestConfig = {
            url: urlString,
            method: init?.method || 'GET',
            data: init?.body,
            headers: (init?.headers as Record<string, string>) || {},
            signal: init?.signal || undefined
        }

        const response = await axiosInstance.request(axiosConfig)

        return new Response(JSON.stringify(response.data), {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers as HeadersInit)
        })
    }
})

/**
 * Helper to make unauthenticated requests
 * Use this for public endpoints that don't require authentication
 *
 * @example
 * // Authenticated call (default, sends cookies)
 * const { data } = await getUser()
 *
 * // Unauthenticated call (doesn't send cookies)
 * const { data } = await getRootStatus(withoutAuth())
 */
export const withoutAuth = () => {
    const axiosInstanceNoAuth = axios.create({
        baseURL: appConfig.apiUrl + '/v1',
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: false
    })

    axiosInstanceNoAuth.interceptors.response.use(response => {
        const nextToken = response.headers['set-auth-token']
        if (typeof nextToken === 'string') {
            authToken.set(nextToken)
        }

        return response
    })

    return {
        fetch: async (url: string | URL | Request, init?: RequestInit) => {
            const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url

            const axiosConfig: AxiosRequestConfig = {
                url: urlString,
                method: init?.method || 'GET',
                data: init?.body,
                headers: (init?.headers as Record<string, string>) || {},
                signal: init?.signal || undefined
            }

            const response = await axiosInstanceNoAuth.request(axiosConfig)

            return new Response(JSON.stringify(response.data), {
                status: response.status,
                statusText: response.statusText,
                headers: new Headers(response.headers as HeadersInit)
            })
        }
    }
}

export { client, axiosInstance }

export * from '@/api/sdk.gen'
export * from '@/api/types.gen'
