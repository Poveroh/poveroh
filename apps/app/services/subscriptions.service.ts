import {
    getSubscription,
    postSubscription,
    putSubscriptionById,
    deleteSubscriptionById,
    type SubscriptionFilters,
    type FilterOptions
} from '@/lib/api-client'

export class SubscriptionService {
    async add(data: FormData) {
        const response = await postSubscription({ body: data as any })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putSubscriptionById({ path: { id }, body: data as any })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteSubscriptionById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: SubscriptionFilters, options?: FilterOptions) {
        const response = await getSubscription({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }
}
