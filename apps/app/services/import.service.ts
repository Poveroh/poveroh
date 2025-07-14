import { IImports, ITransaction } from '@poveroh/types'
import { BaseService } from './base.service'
import { server } from '@/lib/server'

export class ImportService extends BaseService<IImports> {
    constructor() {
        super('/import')
    }

    async readFile(data: FormData): Promise<IImports> {
        return await server.post<IImports>('/import/read-file', data, true)
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
}
