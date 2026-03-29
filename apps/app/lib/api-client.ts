import { client } from '@/api/client.gen'
import appConfig from '@/config'
import { authToken } from '@/lib/auth-token'
import axios, { type AxiosRequestConfig } from 'axios'

/**
 * API client configuration and helper functions
 */
const apiUrl = appConfig.apiUrl + '/v1'

/**
 * Custom query serializer to handle nested objects and arrays in query parameters
 * This is needed because the default URLSearchParams doesn't support complex structures well
 * and hey-api expects a specific format for nested queries.
 */
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

// ------------------------------------------------------------------------------------------

/**
 * Configure axios instance with authentication
 *
 * By default, all requests will include credentials (cookies) for better-auth authentication.
 * The session cookie is automatically sent with each request.
 */
const axiosInstance = axios.create({
    baseURL: apiUrl,
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
    baseUrl: apiUrl,
    querySerializer,
    fetch: async (url: string | URL | Request, init?: RequestInit) => {
        let urlString: string
        let method: string
        let body: unknown
        let headers: Record<string, string>
        let signal: AbortSignal | null | undefined

        if (url instanceof Request) {
            urlString = url.url
            method = url.method
            signal = url.signal ?? undefined

            const contentType = url.headers.get('content-type') ?? ''
            const isMultipart = contentType.includes('multipart/form-data')

            headers = {}
            url.headers.forEach((value, key) => {
                if (!(isMultipart && key.toLowerCase() === 'content-type')) {
                    headers[key] = value
                }
            })

            if (method !== 'GET' && method !== 'HEAD' && url.body !== null) {
                body = isMultipart ? await url.clone().formData() : await url.clone().text()
            }
        } else {
            urlString = typeof url === 'string' ? url : url.toString()
            method = init?.method || 'GET'
            body = init?.body
            headers = (init?.headers as Record<string, string>) || {}
            signal = init?.signal ?? undefined
        }

        const axiosConfig: AxiosRequestConfig = {
            url: urlString,
            method,
            data: body,
            headers,
            signal: signal ?? undefined
        }

        const response = await axiosInstance.request(axiosConfig)

        return new Response(JSON.stringify(response.data), {
            status: response.status,
            statusText: response.statusText,
            headers: new Headers(response.headers as HeadersInit)
        })
    }
})

export { client, axiosInstance }

export * from '@/api/sdk.gen'
export * from '@/api/types.gen'
