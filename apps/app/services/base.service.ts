import { server } from '@/lib/server'

export class BaseService<T> {
    private endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint
    }

    async add(dataToAdd: FormData) {
        return await server.post<T>(`${this.endpoint}/add`, dataToAdd, true)
    }

    async save(dataToSave: FormData) {
        return await server.post<T>(`${this.endpoint}/save`, dataToSave, true)
    }

    async delete(dataToDelete: string) {
        return await server.delete<boolean>(`${this.endpoint}/delete/${dataToDelete}`)
    }

    async read<U, T>(query?: string[] | T): Promise<U> {
        return await server.post<U>(`${this.endpoint}/read`, query)
    }
}
