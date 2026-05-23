import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateSubcategoryRequest,
    SubcategoryData,
    SubcategoryFilters,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { buildWhere } from '@/helpers/filter.helper'

const subcategorySelect = {
    id: true,
    categoryId: true,
    title: true,
    icon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubcategorySelect

export class SubcategoryRepository {
    /** Creates a new subcategory with the provided data and returns the created subcategory data.
     * @param id The unique identifier for the new subcategory.
     * @param payload The data required to create a new subcategory.
     * @returns A promise that resolves to the data of the newly created subcategory.
     */
    async create(id: string, payload: CreateSubcategoryRequest): Promise<SubcategoryData> {
        return (await prisma.subcategory.create({
            data: { ...payload, id },
            select: subcategorySelect
        })) as unknown as SubcategoryData
    }

    /**
     * Updates an existing subcategory with the provided data. The update is scoped to the user who owns the parent category of the subcategory.
     * @param userId The unique identifier of the user who owns the parent category.
     * @param id The unique identifier of the subcategory to update.
     * @param payload The data to update the subcategory with.
     */
    async update(userId: string, id: string, payload: UpdateSubcategoryRequest): Promise<void> {
        await prisma.subcategory.update({
            where: { id, category: { userId }, deletedAt: null },
            data: payload
        })
    }

    /** Soft deletes a subcategory by setting its deletedAt timestamp. The deletion is scoped to the user who owns the parent category of the subcategory.
     * @param userId The unique identifier of the user who owns the parent category.
     * @param id The unique identifier of the subcategory to delete.
     * @param deletedAt The timestamp to set for the deletedAt field, indicating when the subcategory was soft deleted.
     */
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.subcategory.update({
            where: { id, category: { userId }, deletedAt: null },
            data: { deletedAt }
        })
    }

    /** Soft deletes all subcategories belonging to categories owned by the specified user by setting their deletedAt timestamp.
     * @param userId The unique identifier of the user whose subcategories should be soft deleted.
     * @param deletedAt The timestamp to set for the deletedAt field, indicating when the subcategories were soft deleted.
     */
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.subcategory.updateMany({
            where: { category: { userId }, deletedAt: null },
            data: { deletedAt }
        })
    }

    /** Finds a subcategory by its ID, scoped to the user who owns the parent category.
     * @param userId The unique identifier of the user who owns the parent category.
     * @param id The unique identifier of the subcategory to find.
     * @returns A promise that resolves to the subcategory data if found, or null if not found.
     */
    async findById(userId: string, id: string): Promise<SubcategoryData | null> {
        return (await prisma.subcategory.findFirst({
            where: { id, category: { userId }, deletedAt: null },
            select: subcategorySelect
        })) as unknown as SubcategoryData | null
    }

    /** Finds multiple subcategories based on filters, scoped to the user who owns the parent category.
     * @param userId The unique identifier of the user who owns the parent category.
     * @param filters The filters to apply when searching for subcategories.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to an array of subcategory data.
     */
    async findMany(
        userId: string,
        filters: SubcategoryFilters,
        skip: number,
        take: number
    ): Promise<SubcategoryData[]> {
        const filterWhere = buildWhere({ ...filters, deletedAt: null }, ['title'])

        return (await prisma.subcategory.findMany({
            where: {
                ...filterWhere,
                category: { userId }
            },
            select: subcategorySelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as SubcategoryData[]
    }
}
