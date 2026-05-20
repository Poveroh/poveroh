import type { CategoryData, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types'
import { CATEGORY_TEMPLATE } from '@/v1/content/template/category'
import prisma, { Prisma } from '@poveroh/prisma'
import { buildWhere } from '@/helpers'

const subcategorySelect = {
    id: true,
    categoryId: true,
    title: true,
    icon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubcategorySelect

const categorySelect = {
    id: true,
    title: true,
    for: true,
    icon: true,
    color: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.CategorySelect

const categoryWithSubcategoriesSelect = {
    ...categorySelect,
    subcategories: {
        where: { deletedAt: null },
        select: subcategorySelect
    }
} satisfies Prisma.CategorySelect

export class CategoryRepository {
    /**
     * Creates a new category in the database, associating it with the specified user and using the provided payload for the category details.
     * @param userId The ID of the user who is creating the category.
     * @param id The unique identifier for the category being created.
     * @param payload An object containing the details of the category to be created.
     * @returns A promise that resolves to a CategoryData object representing the newly created category.
     */
    async create(userId: string, id: string, payload: CreateCategoryRequest): Promise<CategoryData> {
        return (await prisma.category.create({
            data: { id, ...payload, userId },
            select: categorySelect
        })) as unknown as CategoryData
    }

    /**
     * Creates a set of default categories based on a predefined template, associating them with the specified user.
     * @param userId The ID of the user for whom the default categories are being created.
     * @returns A promise that resolves to an array of CategoryData objects, each representing a category that was created based on the predefined template.
     */
    async createFromTemplate(userId: string): Promise<CategoryData[]> {
        return (await prisma.$transaction(
            CATEGORY_TEMPLATE.map(category =>
                prisma.category.create({
                    data: {
                        title: category.title,
                        for: category.for,
                        icon: category.icon,
                        color: category.color ?? '#8B5CF6',
                        userId,
                        subcategories: {
                            create: (category.subcategories ?? []).map(subcategory => ({
                                title: subcategory.title,
                                icon: subcategory.icon
                            }))
                        }
                    },
                    select: categoryWithSubcategoriesSelect
                })
            )
        )) as unknown as CategoryData[]
    }

    /**
     * Updates an existing category in the database, ensuring that the category belongs to the specified user and is not soft-deleted.
     * @param userId The ID of the user who owns the category being updated.
     * @param id The unique identifier of the category that is being updated.
     * @param payload An object containing the new details for the category.
     */
    async update(userId: string, id: string, payload: UpdateCategoryRequest): Promise<void> {
        await prisma.category.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    /**
     * Soft-deletes a category and its child subcategories in the same transaction.
     * @param userId The ID of the user who owns the category being deleted.
     * @param id The unique identifier of the category that is being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where: { categoryId: id, category: { userId }, deletedAt: null },
                data: { deletedAt }
            }),
            prisma.category.update({
                where: { id, userId, deletedAt: null },
                data: { deletedAt }
            })
        ])
    }

    /**
     * Soft-deletes all categories owned by the specified user, along with their child subcategories, in the same transaction.
     * @param userId The ID of the user whose categories are being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where: { category: { userId, deletedAt: null }, deletedAt: null },
                data: { deletedAt }
            }),
            prisma.category.updateMany({
                where: { userId, deletedAt: null },
                data: { deletedAt }
            })
        ])
    }

    /**
     * Finds a category by its user-scoped ID, ensuring that the category belongs to the specified user and is not soft-deleted.
     * @param userId The ID of the user who owns the category being retrieved.
     * @param id The unique identifier of the category that is being retrieved.
     * @returns A promise that resolves to a CategoryData object representing the category that was found, or null if no category is found.
     */
    async findById(userId: string, id: string): Promise<CategoryData | null> {
        return (await prisma.category.findFirst({
            where: { id, userId, deletedAt: null },
            select: categoryWithSubcategoriesSelect
        })) as unknown as CategoryData | null
    }

    /**
     * Finds categories based on the specified filters, ensuring that they belong to the specified user and are not soft-deleted.
     * @param userId The ID of the user who owns the categories being retrieved.
     * @param filters An object containing various filters that can be applied to narrow down the search results.
     * @param skip The number of categories to skip in the result set, used for pagination purposes.
     * @param take The number of categories to return in the result set, used for pagination purposes.
     * @returns A promise that resolves to an array of CategoryData objects representing the categories that were found based on the specified filters, ownership, and visibility criteria.
     */
    async findMany(userId: string, filters: CategoryFilters, skip: number, take: number): Promise<CategoryData[]> {
        const where = buildWhere({ ...filters, deletedAt: null, userId }, ['title'])

        return (await prisma.category.findMany({
            where,
            select: categoryWithSubcategoriesSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as CategoryData[]
    }
}
