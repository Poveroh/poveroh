import {
    getCategory,
    postCategory,
    putCategoryById,
    deleteCategoryById,
    getSubcategory,
    postSubcategory,
    putSubcategoryById,
    deleteSubcategoryById,
    type CategoryFilters,
    type SubcategoryFilters,
    type FilterOptions
} from '@/lib/api-client'

export class CategoryService {
    async add(data: FormData) {
        const response = await postCategory({ body: data as any })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putCategoryById({ path: { id }, body: data as any })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteCategoryById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: CategoryFilters, options?: FilterOptions) {
        const response = await getCategory({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }
}

export class SubcategoryService {
    async add(data: FormData) {
        const response = await postSubcategory({ body: data as any })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putSubcategoryById({ path: { id }, body: data as any })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteSubcategoryById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: SubcategoryFilters, options?: FilterOptions) {
        const response = await getSubcategory({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }
}
