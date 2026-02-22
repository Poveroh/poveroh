import {
    getImport,
    postImport,
    deleteImportById,
    putImportCompleteById,
    postImportReadFile,
    getImportTransactionById,
    putImportTransactionById,
    deleteImportTransactionById,
    postImportTemplate,
    type ImportsFile,
    type FilterOptions
} from '@/lib/api-client'

export class ImportService {
    async add(data: FormData) {
        const response = await postImport({ body: data as any })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteImportById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: ImportsFile, options?: FilterOptions) {
        const response = await getImport({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }

    async complete(id: string) {
        const response = await putImportCompleteById({ path: { id } })
        return response.data
    }

    async readFile(data: FormData) {
        const response = await postImportReadFile({ body: data as any })
        return response.data
    }

    async readTransaction(id: string) {
        const response = await getImportTransactionById({ path: { id } })
        return response.data
    }

    async saveTransaction(id: string, data: FormData) {
        const response = await putImportTransactionById({
            path: { id },
            body: data as any
        })
        return response.data
    }

    async deleteTransaction(transaction_id: string) {
        const response = await deleteImportTransactionById({
            path: { id: transaction_id }
        })
        return response.data
    }

    async importTemplates(action: string) {
        const response = await postImportTemplate({
            body: { action }
        })
        return response.data
    }
}
