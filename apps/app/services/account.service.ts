import {
    getFinancialAccount,
    postFinancialAccount,
    putFinancialAccountById,
    deleteFinancialAccountById,
    type FinancialAccountFilters,
    type FilterOptions
} from '@/lib/api-client'

export class FinancialAccountService {
    async add(data: FormData) {
        const response = await postFinancialAccount({ body: data })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putFinancialAccountById({ path: { id }, body: data })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteFinancialAccountById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: FinancialAccountFilters, options?: FilterOptions) {
        const response = await getFinancialAccount({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }
}
