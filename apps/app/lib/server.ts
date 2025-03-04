import axios, { AxiosError, AxiosResponse } from 'axios'
import { ServerRequest } from '@poveroh/types'

export const server = {
    send<T>(type: ServerRequest, url: string, data: any, source?: string): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            let res: AxiosResponse
            try {
                url = process.env.NEXT_PUBLIC_API_URL + url
                switch (type) {
                    case ServerRequest.GET:
                        res = await axios.get(url)
                        break
                    case ServerRequest.POST:
                        res = await axios.post(url, data, {
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
                    errorMessage = error.response?.data.message
                } else if (error instanceof Error) {
                    errorMessage = error.message
                }

                console.log(errorMessage)

                reject(error)
            }
        })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post<T>(url: string, data: any, source?: string): Promise<T> {
        return this.send<T>(ServerRequest.POST, url, data, source)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<T>(url: string, data: any, source?: string): Promise<T> {
        return this.send<T>(ServerRequest.POST, url, data, source)
    }
}
