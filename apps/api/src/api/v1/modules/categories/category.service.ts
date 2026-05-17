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
     * Creates a new category for the current user, optionally handling an uploaded icon file. The method generates a unique identifier for the new category, processes the file upload if a file is provided, and then saves the category data to the repository. After successful creation, it emits a 'category.created' event with relevant details for any listeners that need to react to the creation of a new category. This allows for decoupled handling of side effects such as cache invalidation or analytics tracking in response to category creation.
     * @param payload The data required to create a new category, typically including properties such as the category title and any other relevant information defined in the CreateCategoryRequest type. This payload is validated and processed to ensure that it meets the necessary requirements for creating a category in the system.
     * @param file An optional file object representing the uploaded icon for the category. If provided, this file will be processed and saved using the saveFile method, and the resulting URL or identifier will be associated with the category being created. This allows users to customize their categories with icons, enhancing the visual organization of their data.
     * @returns A promise that resolves to the data of the newly created category, including any generated identifiers and the URL of the uploaded icon if a file was provided. This data can be used by the caller to confirm the successful creation of the category and to display or further process the new category information as needed.
     */
    async createCategory(payload: CreateCategoryRequest, file?: Express.Multer.File): Promise<CategoryData> {
        const userId = this.getCurrentUserId()

        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.saveFile(generatedId, file)
        }

        const category = await this.categoryRepository.create(userId, generatedId, payloadWithIcon)
        await eventBus.emit('category.created', { categoryId: category.id, userId })

        return category
    }

    /**
     * Creates categories from a predefined template for the current user. This method is useful for quickly setting up a set of default categories without requiring manual input for each one.
     * @returns A promise that resolves to an array of category data created from the template. Each element in the array represents a newly created category, including any generated identifiers and associated data.
     */
    async createFromTemplate(): Promise<CategoryData[]> {
        const userId = this.getCurrentUserId()

        return this.categoryRepository.createFromTemplate(userId)
    }

    /**
     *
     * @param id The unique identifier of the category to be updated. This ID is used to locate the existing category in the repository and apply the updates.
     * @param payload The data required to update the category, typically including properties such as the category title and any other relevant information defined in the UpdateCategoryRequest type. This payload is validated and processed to ensure that it meets the necessary requirements for updating a category in the system.
     * @param file An optional file object representing the uploaded icon for the category. If provided, this file will be processed and saved using the saveFile method, and the resulting URL or identifier will be associated with the category being updated. This allows users to customize their categories with icons, enhancing the visual organization of their data.
     */
    async updateCategory(id: string, payload: UpdateCategoryRequest, file?: Express.Multer.File): Promise<void> {
        const userId = this.getCurrentUserId()

        if (file) {
            payload.icon = await this.saveFile(id, file)
        }

        await this.categoryRepository.update(userId, id, payload)
        await eventBus.emit('category.updated', { categoryId: id, userId })
    }

    /**
     * Soft-deletes a category by marking it as deleted in the repository. This method ensures that the category is not permanently removed from the database, allowing for potential recovery or historical reference. It also emits a 'category.deleted' event to notify any listeners of the deletion, enabling decoupled handling of side effects such as cache invalidation or analytics tracking in response to category deletion.
     * @param id The unique identifier of the category to be deleted. This ID is used to locate the existing category in the repository and apply the soft-delete operation.
     */
    async deleteCategory(id: string): Promise<void> {
        const userId = this.getCurrentUserId()

        await this.categoryRepository.softDelete(userId, id, new Date())
        await eventBus.emit('category.deleted', { categoryId: id, userId })
    }

    /**
     * Soft-deletes all categories for the current user by marking them as deleted in the repository. This method ensures that the categories are not permanently removed from the database, allowing for potential recovery or historical reference.
     * @returns A promise that resolves when all categories have been soft-deleted.
     */
    async deleteAllCategories(): Promise<void> {
        const userId = this.getCurrentUserId()
        await this.categoryRepository.softDeleteAll(userId, new Date())
    }

    /**
     * Retrieves a category by its unique identifier for the current user. This method is useful for fetching detailed information about a specific category, including any associated data.
     * @param id The unique identifier of the category to be retrieved. This ID is used to locate the existing category in the repository.
     * @returns A promise that resolves to the category data if found, or null if the category does not exist.
     */
    async getCategoryById(id: string): Promise<CategoryData | null> {
        const userId = this.getCurrentUserId()
        return this.categoryRepository.findById(userId, id)
    }

    /**
     * Retrieves a list of categories for the current user based on provided filters and pagination parameters. This method allows for flexible querying of categories, enabling clients to fetch categories that match specific criteria and to control the number of results returned through pagination.
     * @param filters The filters to apply when querying categories. These filters can include various criteria such as category name, creation date, or other attributes.
     * @param skip The number of categories to skip, useful for pagination.
     * @param take The number of categories to take, useful for pagination.
     * @returns A promise that resolves to an array of category data matching the specified filters and pagination parameters.
     */
    async getCategories(filters: CategoryFilters, skip: number, take: number): Promise<CategoryData[]> {
        const userId = this.getCurrentUserId()
        return this.categoryRepository.findMany(userId, filters, skip, take)
    }

    /**
     * Checks if a category exists for the current user based on its unique identifier. This method is useful for validating the existence of a category before performing operations that require an existing category, such as updates or deletions.
     * @param id The unique identifier of the category to check for existence. This ID is used to locate the existing category in the repository.
     * @returns A promise that resolves to true if the category exists for the current user, or false if it does not exist.
     */
    async doesCategoryExist(id: string): Promise<boolean> {
        const userId = this.getCurrentUserId()
        return Boolean(await this.categoryRepository.findById(userId, id))
    }
}
