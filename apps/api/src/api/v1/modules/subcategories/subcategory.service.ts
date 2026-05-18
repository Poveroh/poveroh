import type {
    CreateSubcategoryRequest,
    SubcategoryData,
    SubcategoryFilters,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { BaseService } from '@/src/api/v1/modules/base/base.service'
import { NotFoundError } from '@/src/utils'
import { eventBus } from '@/src/api/v1/events/event-bus'
import { CategoryRepository } from '../categories/category.repository'
import { SubcategoryRepository } from './subcategory.repository'

export class SubcategoryService extends BaseService {
    private readonly categoryRepository = new CategoryRepository()
    private readonly subcategoryRepository = new SubcategoryRepository()

    constructor() {
        super('subcategory')
    }

    // Creates a subcategory only under a category owned by the authenticated user.
    async createSubcategory(payload: CreateSubcategoryRequest, file?: Express.Multer.File): Promise<SubcategoryData> {
        const userId = this.getUserId()
        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.saveFile(generatedId, file)
        }

        const category = await this.categoryRepository.findById(userId, payload.categoryId)
        if (!category) throw new NotFoundError('Category not found for the provided categoryId')

        const subcategory = await this.subcategoryRepository.create(generatedId, payloadWithIcon)
        await eventBus.emit('subcategory.created', { subcategoryId: subcategory.id, userId })

        return subcategory
    }

    // Updates a subcategory through parent ownership.
    async updateSubcategory(id: string, payload: UpdateSubcategoryRequest, file?: Express.Multer.File): Promise<void> {
        const userId = this.getUserId()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.icon = await this.saveFile(id, file)
        }

        await this.subcategoryRepository.update(userId, id, payloadWithIcon)
        await eventBus.emit('subcategory.updated', { subcategoryId: id, userId })
    }

    // Soft-deletes one subcategory.
    async deleteSubcategory(id: string): Promise<void> {
        const userId = this.getUserId()
        await this.subcategoryRepository.softDelete(userId, id, new Date())
        await eventBus.emit('subcategory.deleted', { subcategoryId: id, userId })
    }

    // Soft-deletes every subcategory owned through the user's categories.
    async deleteAllSubcategories(): Promise<void> {
        await this.subcategoryRepository.softDeleteAll(this.getUserId(), new Date())
    }

    // Reads one subcategory DTO through owner scope.
    async getSubcategoryById(id: string): Promise<SubcategoryData | null> {
        return this.subcategoryRepository.findById(this.getUserId(), id)
    }

    // Reads subcategory DTOs with repository-owned filtering.
    async getSubcategories(filters: SubcategoryFilters, skip: number, take: number): Promise<SubcategoryData[]> {
        return this.subcategoryRepository.findMany(this.getUserId(), filters, skip, take)
    }
}
