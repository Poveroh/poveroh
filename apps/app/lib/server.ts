import axios, { AxiosError, AxiosResponse } from 'axios'
import { ServerRequest } from '@poveroh/types'
import { appConfig } from '@/config'

export const server = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send<T>(type: ServerRequest, url: string, data: any): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let res: AxiosResponse
            try {
                const urlToSend = new URL(url, appConfig.apiUrl)
                switch (type) {
                    case ServerRequest.GET:
                        res = await axios.get(urlToSend.href)
                        break
                    case ServerRequest.POST:
                        res = await axios.post(urlToSend.href, data, {
                            withCredentials: true
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
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                reject(errorMessage)
            }
        })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post<T>(url: string, data: any): Promise<T> {
        return this.send<T>(ServerRequest.POST, url, data)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<T>(url: string, data: any): Promise<T> {
        return this.send<T>(ServerRequest.POST, url, data)
    }
}
