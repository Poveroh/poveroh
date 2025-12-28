import { server } from '@/lib/server'
import { IFilterOptions } from '@poveroh/types'
import qs from 'qs'

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

    async read<U, F = unknown>(filters?: F, options?: IFilterOptions): Promise<{ data: U; total: number }> {
        const queryObject: Record<string, unknown> = {}

        if (filters) queryObject.filter = filters
        if (options) queryObject.options = options

        const query = qs.stringify(queryObject, { encode: true, indices: false })

        return await server.get<{ data: U; total: number }>(`${this.endpoint}?${query}`)
    }
}
