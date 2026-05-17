import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateSubcategoryRequest,
    SubcategoryData,
    SubcategoryFilters,
    UpdateSubcategoryRequest
} from '@poveroh/types'
import { buildWhere } from '@/src/helpers/filter.helper'

const subcategorySelect = {
    id: true,
    categoryId: true,
    title: true,
    icon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubcategorySelect

type SubcategoryRow = Prisma.SubcategoryGetPayload<{ select: typeof subcategorySelect }>

// Prisma returns Date for timestamps; the API contract uses ISO strings.
function toData(row: SubcategoryRow): SubcategoryData {
    return {
        id: row.id,
        categoryId: row.categoryId,
        title: row.title,
        icon: row.icon,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    }
}

export class SubcategoryRepository {
    // Subcategories inherit ownership through their category.
    async create(id: string, payload: CreateSubcategoryRequest): Promise<SubcategoryData> {
        const row = await prisma.subcategory.create({
            data: { ...payload, id },
            select: subcategorySelect
        })
        return toData(row)
    }

    // Updates are scoped through the parent category owner.
    async update(userId: string, id: string, payload: UpdateSubcategoryRequest): Promise<void> {
        await prisma.subcategory.update({
            where: { id, category: { userId }, deletedAt: null },
            data: payload
        })
    }

    // Soft delete keeps category history stable.
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.subcategory.update({
            where: { id, category: { userId }, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Bulk deletes are scoped by parent category owner.
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.subcategory.updateMany({
            where: { category: { userId }, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Reads require both id and parent category owner.
    async findById(userId: string, id: string): Promise<SubcategoryData | null> {
        const row = await prisma.subcategory.findFirst({
            where: { id, category: { userId }, deletedAt: null },
            select: subcategorySelect
        })
        return row ? toData(row) : null
    }

    // Filters are combined with ownership and soft-delete conditions in one place.
    async findMany(
        userId: string,
        filters: SubcategoryFilters,
        skip: number,
        take: number
    ): Promise<SubcategoryData[]> {
        const filterWhere = buildWhere({ ...filters, deletedAt: null }, ['title'])

        const rows = await prisma.subcategory.findMany({
            where: {
                ...filterWhere,
                category: { userId }
            },
            select: subcategorySelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })
        return rows.map(toData)
    }
}
