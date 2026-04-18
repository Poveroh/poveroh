import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { CategoryFilters, CreateCategoryRequest, CategoryData, UpdateCategoryRequest } from '@poveroh/types'
import { BaseService } from './base.service'
import { CATEGORY_TEMPLATE } from '../content/template/category'

/**
 * Service class for managing categories, including creating, updating, deleting, and retrieving categories for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class CategoryService extends BaseService {
    /**
     * Initializes the CategoryService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'category')
    }

    /**
     * Creates a new category for the authenticated user with the provided data and optional logo file
     * User ID is automatically retrieved from request context
     * @param payload The data for the new category
     * @param file An optional logo file for the category
     * @returns The created category data response
     */
    async createCategory(payload: CreateCategoryRequest, file?: Express.Multer.File): Promise<CategoryData> {
        const userId = this.getUserId()

        const generatedId = crypto.randomUUID()

        return (await prisma.category.create({
            data: {
                id: generatedId,
                ...payload,
                userId
            }
        })) as unknown as CategoryData
    }

    /**
     * Creates default categories for the authenticated user based on a predefined template
     * User ID is automatically retrieved from request context
     * @return An array of created category data responses based on the template
     */
    async createFromTemplate(): Promise<CategoryData[]> {
        const userId = this.getUserId()

        const categories = await prisma.$transaction(
            CATEGORY_TEMPLATE.map(category =>
                prisma.category.create({
                    data: {
                        title: category.title,
                        for: category.for,
                        icon: category.icon,
                        color: category.color ?? '#8B5CF6',
                        userId,
                        subcategories: {
                            create: (category.subcategories ?? []).map(sub => ({
                                title: sub.title,
                                icon: sub.icon
                            }))
                        }
                    },
                    omit: { userId: true, deletedAt: true },
                    include: { subcategories: true }
                })
            )
        )

        return categories as unknown as CategoryData[]
    }

    /**
     * Updates an existing category with the specified ID for the authenticated user
     * User ID is automatically retrieved from request context
     * @param id The ID of the category to update
     * @param payload The data to update the category with
     * @param file An optional logo file for the category
     */

    async updateCategory(id: string, payload: UpdateCategoryRequest, file?: Express.Multer.File): Promise<void> {
        const userId = this.getUserId()

        await prisma.category.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    /**
     * Deletes a category with the specified ID, along with its associated subcategories
     * User ID is automatically retrieved from request context
     * @param id The ID of the category to delete
     */
    async deleteCategory(id: string): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where: { categoryId: id, deletedAt: null },
                data: { deletedAt }
            }),
            prisma.category.update({
                where: { id, userId, deletedAt: null },
                data: { deletedAt }
            })
        ])
    }

    /**
     * Deletes all categories and their associated subcategories for the authenticated user
     * User ID is automatically retrieved from request context
     */
    async deleteAllCategories(): Promise<void> {
        const userId = this.getUserId()
        const deletedAt = new Date()

        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where: { category: { userId, deletedAt: null } },
                data: { deletedAt }
            }),
            prisma.category.updateMany({
                where: { userId, deletedAt: null },
                data: { deletedAt }
            })
        ])
    }

    /**
     * Retrieves a category by its ID, including its associated subcategories
     * User ID is automatically retrieved from request context
     * @param id The ID of the category to retrieve
     * @returns The category data response with its subcategories, or null if not found
     */
    async getCategoryById(id: string): Promise<CategoryData | null> {
        const userId = this.getUserId()

        return (await prisma.category.findMany({
            where: { id, userId, deletedAt: null },
            include: { subcategories: true }
        })) as unknown as CategoryData | null
    }

    /**
     * Retrieves a list of categories based on the provided filters, pagination parameters
     * User ID is automatically retrieved from request context
     * @param filters The filters to apply when retrieving categories
     * @param skip The number of categories to skip for pagination
     * @param take The number of categories to take for pagination
     * @returns An object containing the list of category data responses
     */
    async getCategories(filters: CategoryFilters, skip: number, take: number): Promise<CategoryData[]> {
        const userId = this.getUserId()

        const whereCondition = buildWhere({ ...filters, deletedAt: null, userId }, ['title'])

        return (await prisma.category.findMany({
            where: whereCondition,
            omit: { userId: true, deletedAt: true },
            include: { subcategories: { where: { deletedAt: null } } },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as CategoryData[]
    }

    /**
     * Checks if a category with the specified ID exists for the authenticated user
     * User ID is automatically retrieved from request context
     * @param id The ID of the category to check for existence
     * @returns True if the category exists, false otherwise
     */
    async doesCategoryExist(id: string): Promise<boolean> {
        const category = await this.getCategoryById(id)

        return !!category
    }
}
