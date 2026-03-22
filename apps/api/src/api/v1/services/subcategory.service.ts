import prisma from '@poveroh/prisma'
import { buildWhere } from '../../../helpers/filter.helper'
import { BaseService } from './base.service'
import { CreateSubcategoryRequest, SubcategoryData, SubcategoryFilters, UpdateSubcategoryRequest } from '@poveroh/types'
import { CategoryService } from './category.service'

/**
 * Service class for managing subcategories, including creating, updating, deleting, and retrieving subcategories for the authenticated user
 * All methods automatically retrieve the user ID from the request context.
 */
export class SubcategoryService extends BaseService {
    /**
     * Initializes the SubcategoryService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'subcategory')
    }

    /**
     * Creates a new subcategory with the provided data and optional logo file
     * @param payload The data for the new subcategory
     * @param file An optional logo file for the subcategory
     * @returns The created subcategory data response
     */
    async createSubcategory(payload: CreateSubcategoryRequest, file?: Express.Multer.File): Promise<SubcategoryData> {
        const generatedId = crypto.randomUUID()

        if (file) {
            payload.logoIcon = await this.saveFile(generatedId, file)
        }

        const categoryService = new CategoryService(this.getUserId())
        const doesCategoryExist = await categoryService.doesCategoryExist(payload.categoryId)

        if (!doesCategoryExist) {
            throw new Error('Category not found for the provided categoryId')
        }

        return (await prisma.subcategory.create({
            data: { ...payload, id: generatedId }
        })) as unknown as SubcategoryData
    }

    /**
     * Updates an existing subcategory with the specified ID for the authenticated user
     * @param id The ID of the subcategory to update
     * @param payload The updated data for the subcategory
     * @param file An optional new logo file for the subcategory
     * @returns The updated subcategory data response
     */
    async updateSubcategory(id: string, payload: UpdateSubcategoryRequest, file?: Express.Multer.File): Promise<void> {
        const userId = this.getUserId()

        if (file) {
            payload.logoIcon = await this.saveFile(id, file)
        }

        await prisma.subcategory.update({
            where: {
                id,
                category: { userId },
                deletedAt: null
            },
            data: payload
        })
    }

    /**
     * Deletes a subcategory with the specified ID for the authenticated user
     * @param id The ID of the subcategory to delete
     */
    async deleteSubcategory(id: string): Promise<void> {
        const userId = this.getUserId()

        await prisma.subcategory.update({
            where: {
                id,
                category: { userId },
                deletedAt: null
            },
            data: { deletedAt: new Date() }
        })
    }

    /**
     * Deletes all subcategories for the authenticated user
     */
    async deleteAllSubcategories(): Promise<void> {
        const userId = this.getUserId()

        await prisma.subcategory.updateMany({
            where: {
                category: { userId },
                deletedAt: null
            },
            data: { deletedAt: new Date() }
        })
    }

    /**
     * Retrieves a subcategory by its ID for the authenticated user
     * @param id The ID of the subcategory to retrieve
     * @returns The subcategory data response if found, or null if not found
     */
    async getSubcategoryById(id: string): Promise<SubcategoryData | null> {
        const userId = this.getUserId()

        return (await prisma.subcategory.findFirst({
            where: {
                id,
                category: { userId },
                deletedAt: null
            }
        })) as unknown as SubcategoryData | null
    }

    /**
     * Retrieves subcategories for the authenticated user based on the provided filters and pagination
     * @param filters The filters to apply to the subcategory query
     * @param skip The number of subcategories to skip for pagination
     * @param take The number of subcategories to take for pagination
     * @returns The list of subcategory data responses
     */
    async getSubcategories(filters: SubcategoryFilters, skip: number, take: number): Promise<SubcategoryData[]> {
        const userId = this.getUserId()

        const where = {
            ...buildWhere(filters),
            category: { userId },
            deletedAt: null
        }

        return (await prisma.subcategory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as SubcategoryData[]
    }
}
