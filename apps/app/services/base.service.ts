import { server } from '@/lib/server'
import { buildFilters } from '@/utils/server'
import { IFilterOptions } from '@poveroh/types'

export class BaseService<T> {
    private endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    async add(data: FormData | Partial<T>): Promise<T> {
        const isFormData = data instanceof FormData
        return await server.post<T>(this.endpoint, data, isFormData)
    }

    async save(id: string, data: FormData | Partial<T>): Promise<T> {
        const isFormData = data instanceof FormData
        return await server.put<T>(`${this.endpoint}/${id}`, data, isFormData)
    }

    async delete(id: string): Promise<boolean> {
        return await server.delete<boolean>(`${this.endpoint}/${id}`)
    }

    async clear(): Promise<boolean> {
        return this.delete('all')
    }

    async read<U, F = unknown>(filters?: F, options?: IFilterOptions): Promise<{ data: U; total: number }> {
        const query = buildFilters<F>(filters, options)

        return await server.get<{ data: U; total: number }>(`${this.endpoint}?${query}`)
    }
}
