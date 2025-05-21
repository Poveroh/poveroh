import { server } from '@/lib/server'
import { toQueryString } from '@/utils/query'

export class BaseService<T> {
    private endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    async add(data: FormData): Promise<T> {
        return await server.post<T>(this.endpoint, data, true)
    }

    async save(id: string, data: FormData): Promise<T> {
        return await server.put<T>(`${this.endpoint}/${id}`, data, true)
    }

    async delete(id: string): Promise<boolean> {
        return await server.delete<boolean>(`${this.endpoint}/${id}`)
    }

    async read<U, F = any>(filters?: F): Promise<U> {
        const query = filters ? toQueryString(filters) : ''
        return await server.get<U>(`${this.endpoint}?${query}`)
    }
}
