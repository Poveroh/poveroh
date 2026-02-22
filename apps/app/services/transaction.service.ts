import {
    getTransaction,
    postTransaction,
    putTransactionById,
    deleteTransactionById,
    type TransactionFilters,
    type FilterOptions
} from '@/lib/api-client'

export class TransactionService {
    async add(data: FormData) {
        const response = await postTransaction({
            body: data
        })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putTransactionById({
            path: { id },
            body: data
        })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteTransactionById({
            path: { id }
        })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: TransactionFilters, options?: FilterOptions) {
        const response = await getTransaction({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }
}
