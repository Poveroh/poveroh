import {
    getUser,
    postUser,
    putUserById,
    deleteUserById,
    putUserSetPasswordById,
    type UserFilters,
    type FilterOptions,
    type PasswordToChange
} from '@/lib/api-client'

export class UserService {
    async add(data: FormData) {
        const response = await postUser({ body: data })
        return response.data
    }

    async save(id: string, data: FormData) {
        const response = await putUserById({ path: { id }, body: data })
        return response.data
    }

    async delete(id: string) {
        const response = await deleteUserById({ path: { id } })
        return response.data
    }

    async clear() {
        return this.delete('all')
    }

    async read(filters?: UserFilters, options?: FilterOptions) {
        const response = await getUser({
            query: {
                filter: filters,
                options: options
            }
        })
        return response.data
    }

    async updatePassword(id: string, passwords: PasswordToChange) {
        const response = await putUserSetPasswordById({
            path: { id },
            body: passwords
        })
        return response.data
    }
}
