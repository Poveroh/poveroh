import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { MediaHelper } from '../../../helpers/media.helper'
import {
    CategoryFilters,
    CreateCategoryRequest,
    CategoryDataResponse,
    UpdateCategoryRequest
} from '@poveroh/types/contracts'

export class CategoryService {
    /**
     * Creates a new category for the specified user with the provided data and optional logo file
     * @param userId The ID of the user creating the category
     * @param payload The data for the new category
     * @param file An optional logo file for the category
     * @returns The created category data response
     */

    static async createCategory(
        userId: string,
        payload: CreateCategoryRequest,
        file?: Express.Multer.File
    ): Promise<CategoryDataResponse> {
        const categoryPayload: CreateCategoryRequest = { ...payload }

        if (file) {
            const filePath = await MediaHelper.handleUpload(file, `${userId}/category/${categoryPayload.title}`)
            categoryPayload.logoIcon = filePath
        }

        return (await prisma.category.create({
            data: {
                ...categoryPayload,
                userId
            },
            omit: {
                userId: true,
                deletedAt: true
            }
        })) as unknown as CategoryDataResponse
    }

    /**
     * Updates an existing category with the specified ID for the given user, using the provided data and optional logo file
     * @param id The ID of the category to update
     * @param userId The ID of the user performing the update
     * @param payload The data to update the category with
     * @param file An optional logo file for the category
     * @returns A promise that resolves when the update is complete
     */

    static async updateCategory(
        id: string,
        userId: string,
        payload: UpdateCategoryRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const categoryPayload: UpdateCategoryRequest = { ...payload }

        if (file) {
            const filePath = await MediaHelper.handleUpload(file, `${userId}/category/${categoryPayload.title}`)
            categoryPayload.logoIcon = filePath
        }

        await prisma.category.update({
            where: { id },
            data: categoryPayload
        })
    }

    /**
     * Deletes a category with the specified ID, along with its associated subcategories
     * @param id The ID of the category to delete
     * @returns A promise that resolves when the deletion is complete
     */
    static async deleteCategory(id: string): Promise<void> {
        const deletedAt = new Date()

        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where: { categoryId: id },
                data: { deletedAt }
            }),
            prisma.category.update({
                where: { id },
                data: { deletedAt }
            })
        ])
    }

    /**
     * Deletes all categories and their associated subcategories from the system
     * @returns A promise that resolves when all categories and subcategories have been deleted
     */
    static async deleteAllCategories(): Promise<void> {
        const deletedAt = new Date()

        await prisma.$transaction([
            prisma.subcategory.updateMany({
                data: { deletedAt }
            }),
            prisma.category.updateMany({
                data: { deletedAt }
            })
        ])
    }

    /**
     * Retrieves a category by its ID, including its associated subcategories
     * @param id The ID of the category to retrieve
     * @returns The category data response with its subcategories
     */
    static async getCategoryById(id: string): Promise<CategoryDataResponse> {
        return (await prisma.category.findMany({
            where: { id },
            include: { subcategories: true }
        })) as unknown as CategoryDataResponse
    }

    /**
     * Retrieves a list of categories based on the provided filters, pagination parameters, and includes their associated subcategories
     * @param filters The filters to apply when retrieving categories
     * @param skip The number of categories to skip for pagination
     * @param take The number of categories to take for pagination
     * @returns An object containing the list of category data responses
     */
    static async getCategories(filters: CategoryFilters, skip: number, take: number): Promise<CategoryDataResponse[]> {
        const where = buildWhere(filters)

        return (await prisma.category.findMany({
            where,
            include: { subcategories: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as CategoryDataResponse[]
    }
}
