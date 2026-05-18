import type { CategoryData, CategoryFilters, CreateCategoryRequest, UpdateCategoryRequest } from '@poveroh/types'
import { BaseService } from '@/v1/modules/base/base.service'
import { CategoryRepository } from './category.repository'
import { eventBus } from '@/v1/events/event-bus'

export class CategoryService extends BaseService {
    private readonly categoryRepository = new CategoryRepository()

    constructor() {
        super('category')
    }

    /**
     * Creates a new category for the current user, optionally handling an uploaded icon file.
     * @param payload The data required to create a new category
     * @param file An optional file object representing the uploaded icon for the category.
     * If provided, this file will be processed and saved using the saveFile method, and the resulting URL or identifier will be associated with the category being created.
     * @returns A promise that resolves to the data of the newly created category
     */
    async createCategory(payload: CreateCategoryRequest, file?: Express.Multer.File): Promise<CategoryData> {
        const userId = this.context.currentUser.id

        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.media.saveFile(generatedId, file)
        }

        const category = await this.categoryRepository.create(userId, generatedId, payloadWithIcon)
        await eventBus.emit('category.created', { categoryId: category.id, userId })

        return category
    }

    /**
     * Creates categories from a predefined template for the current user.
     * @returns A promise that resolves to an array of category data created from the template.
     */
    async createFromTemplate(): Promise<CategoryData[]> {
        return this.categoryRepository.createFromTemplate(this.context.currentUser.id)
    }

    /**
     * Updates an existing category for the current user, optionally handling an uploaded icon file.
     * @param id The unique identifier of the category to be updated.
     * @param payload The data required to update the category.
     * @param file An optional file object representing the uploaded icon for the category.
     * If provided, this file will be processed and saved using the saveFile method, and the resulting URL or identifier will be associated with the category being updated.
     */
    async updateCategory(id: string, payload: UpdateCategoryRequest, file?: Express.Multer.File): Promise<void> {
        if (file) {
            payload.icon = await this.media.saveFile(id, file)
        }

        const userId = this.context.currentUser.id

        await this.categoryRepository.update(userId, id, payload)
        await eventBus.emit('category.updated', { categoryId: id, userId })
    }

    /**
     * Soft-deletes a category by marking it as deleted in the repository.
     * @param id The unique identifier of the category to be deleted.
     */
    async deleteCategory(id: string): Promise<void> {
        const userId = this.context.currentUser.id
        await this.categoryRepository.softDelete(userId, id, new Date())
        await eventBus.emit('category.deleted', { categoryId: id, userId })
    }

    /**
     * Soft-deletes all categories for the current user by marking them as deleted in the repository.
     * @returns A promise that resolves when all categories have been soft-deleted.
     */
    async deleteAllCategories(): Promise<void> {
        await this.categoryRepository.softDeleteAll(this.context.currentUser.id, new Date())
    }

    /**
     * Retrieves a category by its unique identifier for the current user.
     * @param id The unique identifier of the category to be retrieved.
     * @returns A promise that resolves to the category data if found, or null if the category does not exist.
     */
    async getCategoryById(id: string): Promise<CategoryData | null> {
        return this.categoryRepository.findById(this.context.currentUser.id, id)
    }

    /**
     * Retrieves a list of categories for the current user based on provided filters and pagination parameters.
     * @param filters The filters to apply when querying categories. These filters can include various criteria such as category name, creation date, or other attributes.
     * @param skip The number of categories to skip, useful for pagination.
     * @param take The number of categories to take, useful for pagination.
     * @returns A promise that resolves to an array of category data matching the specified filters and pagination parameters.
     */
    async getCategories(filters: CategoryFilters, skip: number, take: number): Promise<CategoryData[]> {
        return this.categoryRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }

    /**
     * Checks if a category exists for the current user based on its unique identifier.
     * @param id The unique identifier of the category to check for existence.
     * @returns A promise that resolves to true if the category exists for the current user, or false if it does not exist.
     */
    async doesCategoryExist(id: string): Promise<boolean> {
        return Boolean(await this.categoryRepository.findById(this.context.currentUser.id, id))
    }
}
