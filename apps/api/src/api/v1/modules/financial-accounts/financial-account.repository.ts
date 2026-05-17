import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { buildWhere } from '@/src/helpers/filter.helper'

const financialAccountSelect = {
    id: true,
    title: true,
    balance: true,
    type: true,
    logoIcon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.FinancialAccountSelect

type FinancialAccountRow = Prisma.FinancialAccountGetPayload<{ select: typeof financialAccountSelect }>

// Prisma returns Decimal for monetary fields and Date for timestamps; the API contract uses plain JSON primitives.
function toData(row: FinancialAccountRow): FinancialAccountData {
    return {
        id: row.id,
        title: row.title,
        balance: row.balance.toNumber(),
        type: row.type,
        logoIcon: row.logoIcon ?? '',
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    }
}

export class FinancialAccountRepository {
    // Create is scoped with userId at the write boundary.
    async create(userId: string, id: string, payload: CreateFinancialAccountRequest): Promise<FinancialAccountData> {
        const row = await prisma.financialAccount.create({
            data: { ...payload, userId, id },
            select: financialAccountSelect
        })
        return toData(row)
    }

    // Updates are scoped by both id and userId so one user cannot mutate another user's account.
    async update(userId: string, id: string, payload: UpdateFinancialAccountRequest): Promise<void> {
        await prisma.financialAccount.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    // Soft delete keeps financial history auditable.
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.financialAccount.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Bulk deletes are soft deletes for the user's visible account set only.
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.financialAccount.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Reads always exclude soft-deleted accounts and include the owning user scope.
    async findById(userId: string, id: string): Promise<FinancialAccountData | null> {
        const row = await prisma.financialAccount.findFirst({
            where: { id, userId, deletedAt: null },
            select: financialAccountSelect
        })
        return row ? toData(row) : null
    }

    // Filtering stays in the repository so callers do not build Prisma conditions.
    async findMany(
        userId: string,
        filters: FinancialAccountFilters,
        skip: number,
        take: number
    ): Promise<FinancialAccountData[]> {
        const where = buildWhere({ ...filters, deletedAt: null, userId }, ['title'])

        const rows = await prisma.financialAccount.findMany({
            where,
            select: financialAccountSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })
        return rows.map(toData)
    }
}
