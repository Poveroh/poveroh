import axios, { AxiosError, AxiosResponse } from 'axios'
import { ServerRequest } from '@poveroh/types'
import { appConfig } from '@/config'

export const server = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send<T>(type: ServerRequest, url: string, data: any, authenticate: boolean, formData?: boolean): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let res: AxiosResponse

            const headers = {
                'Content-Type': formData ? 'multipart/form-data' : 'application/json'
            }

            try {
                const urlToSend = new URL(url, appConfig.apiUrl)
                switch (type) {
                    case ServerRequest.GET:
                        res = await axios.get(urlToSend.href, {
                            withCredentials: authenticate
                        })
                        break
                    case ServerRequest.POST:
                        res = await axios.post(urlToSend.href, data, {
                            withCredentials: authenticate,
                            headers: {
                                ...headers
                            }
                        })
                        break
                    case ServerRequest.DELETE:
                        res = await axios.delete(urlToSend.href, {
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
                let errorMessage: string = 'Error occurred'

                if (error instanceof AxiosError) {
                    errorMessage = error.response?.data.message || error.message

                    if (error.status == 403) {
                        window.location.href = '/logout'
                    }
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                reject(errorMessage)
            }
        })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post<T>(url: string, data: any, formData?: boolean) {
        return this.send<T>(ServerRequest.POST, url, data, true, formData)
    },
    get<T>(url: string, authenticate: boolean) {
        return this.send<T>(ServerRequest.GET, url, null, authenticate)
    },
    delete<T>(url: string) {
        return this.send<T>(ServerRequest.DELETE, url, null, true)
    }
}
