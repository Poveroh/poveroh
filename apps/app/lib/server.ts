import axios, { AxiosError, AxiosResponse } from 'axios'
import { ServerRequest } from '@poveroh/types'
import appConfig from '@/config'
import { urlJoiner } from '@poveroh/utils'

export const server = {
    // Generic send method
    send<T>(type: ServerRequest, url: string, data: unknown, authenticate: boolean, formData?: boolean): Promise<T> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<T>(async (resolve, reject) => {
            let res: AxiosResponse

            const headers = {
                'Content-Type': formData ? 'multipart/form-data' : 'application/json'
            }

            try {
                const urlToSend = urlJoiner(appConfig.apiUrl, url)

                switch (type) {
                    case ServerRequest.GET:
                        res = await axios.get(urlToSend, {
                            withCredentials: authenticate
                        })
                        break

                    case ServerRequest.POST:
                        res = await axios.post(urlToSend, data, {
                            withCredentials: authenticate,
                            headers
                        })
                        break

                    case ServerRequest.PUT:
                        res = await axios.put(urlToSend, data, {
                            withCredentials: authenticate,
                            headers
                        })
                        break

                    case ServerRequest.DELETE:
                        res = await axios.delete(urlToSend, {
                            withCredentials: authenticate
                        })
                        break

                    default:
                        throw new Error('Invalid request type')
                }

                if (res.status !== 200) {
                    throw new Error(res.data?.message || 'An error occurred')
                }

                resolve(res.data as T)
            } catch (error) {
                let errorMessage = 'An error occurred'

                if (error instanceof AxiosError) {
                    errorMessage = error.response?.data.message || error.message

                    if (error.response?.status === 403) {
                        window.location.href = '/logout'
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                reject(errorMessage)
            }
        })
    },

    post<T>(url: string, data: unknown, formData?: boolean) {
        return server.send<T>(ServerRequest.POST, url, data, true, formData)
    },

    put<T>(url: string, data: unknown, formData?: boolean) {
        return server.send<T>(ServerRequest.PUT, url, data, true, formData)
    },

    get<T>(url: string, authenticate = true) {
        return server.send<T>(ServerRequest.GET, url, null, authenticate)
    },

    delete<T>(url: string) {
        return server.send<T>(ServerRequest.DELETE, url, null, true)
    }
}
