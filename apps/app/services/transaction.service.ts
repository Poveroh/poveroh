import { ITransaction } from '@poveroh/types'
import { BaseService } from './base.service'
import { server } from '@/lib/server'

export class TransactionService extends BaseService<ITransaction> {
    constructor() {
        super('/transaction')
    }

    async readcsv(data: FormData): Promise<ITransaction[]> {
        return await server.post<ITransaction[]>('/transaction/read-csv', data, true)
    }
}
