import { getTransactions, postTransactions, putTransactionsById, deleteTransactionsById } from '@/lib/api-client'

export class TransactionService {
    async add(data: FormData) {
        const response = await postTransactions({
            // @ts-expect-error - API accepts FormData
            body: data
        })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putTransactionsById({
            // @ts-expect-error - OpenAPI schema doesn't define path parameters
            path: { id },
            // @ts-expect-error - API accepts FormData
            body: data
        })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteTransactionsById({
            // @ts-expect-error - OpenAPI schema doesn't define path parameters
            path: { id }
        })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: unknown) {
        const response = await getTransactions({
            // @ts-expect-error - API accepts query params
            query: filters
        })
        return response.data
    }
}
