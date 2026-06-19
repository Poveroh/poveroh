import type {
    CreateSubcategoryRequest,
    SubcategoryData,
    SubcategoryFilters,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { BaseService } from '@/v1/modules/base/base.service'
import { NotFoundError } from '@/utils'
import { eventBus } from '@/v1/worker/events/event-bus'
import { CategoryRepository } from '../categories/category.repository'
import { SubcategoryRepository } from './subcategory.repository'

export class SubcategoryService extends BaseService {
    private readonly categoryRepository = new CategoryRepository()
    private readonly subcategoryRepository = new SubcategoryRepository()

    constructor() {
        super('subcategory')
    }

    /**
     * Creates a new subcategory under a category owned by the authenticated user, optionally handling an uploaded icon file.
     * @param payload The data required to create a new subcategory.
     * @param file An optional file object representing the uploaded icon for the subcategory.
     * @returns A promise that resolves to the data of the newly created subcategory.
     */
    async createSubcategory(payload: CreateSubcategoryRequest, file?: Express.Multer.File): Promise<SubcategoryData> {
        const userId = this.context.currentUser.id
        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.media.saveFile(generatedId, file)
        }

        const category = await this.categoryRepository.findById(userId, payload.categoryId)
        if (!category) throw new NotFoundError('Category not found for the provided categoryId')

        const subcategory = await this.subcategoryRepository.create(generatedId, payloadWithIcon)
        await eventBus.emit('subcategory.created', { userId, data: subcategory })

        return subcategory
    }

    /**
     * Updates an existing subcategory for the authenticated user, optionally handling an uploaded icon file.
     * @param id The unique identifier of the subcategory to be updated.
     * @param payload The data required to update the subcategory.
     * @param file An optional file object representing the uploaded icon for the subcategory.
     * @returns A promise that resolves when the subcategory has been updated.
     */
    async updateSubcategory(id: string, payload: UpdateSubcategoryRequest, file?: Express.Multer.File): Promise<void> {
        const userId = this.context.currentUser.id
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.media.saveFile(id, file)
        }

        await this.subcategoryRepository.update(userId, id, payloadWithIcon)

        const data = await this.subcategoryRepository.findById(userId, id)
        if (data) await eventBus.emit('subcategory.updated', { userId, data })
    }

    /**
     * Soft-deletes a subcategory by marking it as deleted in the repository.
     * @param id The unique identifier of the subcategory to be deleted.
     * @returns A promise that resolves when the subcategory has been soft-deleted.
     */
    async deleteSubcategory(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.subcategoryRepository.findById(userId, id)
        await this.subcategoryRepository.softDelete(userId, id, new Date())

        if (data) await eventBus.emit('subcategory.deleted', { userId, data })
    }

    /**
     * Soft-deletes all subcategories owned through the authenticated user's categories.
     * @returns A promise that resolves when all subcategories have been soft-deleted.
     */
    async deleteAllSubcategories(): Promise<void> {
        await this.subcategoryRepository.softDeleteAll(this.context.currentUser.id, new Date())
    }

    /**
     * Retrieves a subcategory by its unique identifier for the authenticated user.
     * @param id The unique identifier of the subcategory to be retrieved.
     * @returns A promise that resolves to the subcategory data if found, or null if the subcategory does not exist.
     */
    async getSubcategoryById(id: string): Promise<SubcategoryData | null> {
        return this.subcategoryRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Retrieves a list of subcategories for the authenticated user based on provided filters and pagination parameters.
     * @param filters The filters to apply when querying subcategories.
     * @param skip The number of subcategories to skip, useful for pagination.
     * @param take The number of subcategories to take, useful for pagination.
     * @returns A promise that resolves to an array of subcategory data matching the specified filters and pagination parameters.
     */
    async getSubcategories(filters: SubcategoryFilters, skip: number, take: number): Promise<SubcategoryData[]> {
        return this.subcategoryRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }
}
