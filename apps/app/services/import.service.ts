import { IImport, ITransaction } from '@poveroh/types'
import { BaseService } from './base.service'
import { server } from '@/lib/server'

export class ImportService extends BaseService<IImport> {
    constructor() {
        super('/import')
    }

    async complete(id: string): Promise<IImport> {
        return await server.put<IImport>(`/import/complete${'/' + id}`, {}, false)
    }

    async readFile(data: FormData): Promise<IImport> {
        return await server.post<IImport>('/import/read-file', data, true)
    }

    async readTransaction(id: string): Promise<ITransaction[]> {
        return await server.get<ITransaction[]>(`/import/transaction/${id}`)
    }

    async saveTransaction(id: string, data: FormData): Promise<ITransaction> {
        return await server.put<ITransaction>(`/import/transaction/${id}`, data, true)
    }

    async deleteTransaction(transaction_id: string): Promise<boolean> {
        return await server.delete<boolean>(`/import/transaction/${transaction_id}`)
    }

    async importTemplates(action: string): Promise<boolean> {
        return await server.post<boolean>('/import/template', { action }, false)
    }
}
