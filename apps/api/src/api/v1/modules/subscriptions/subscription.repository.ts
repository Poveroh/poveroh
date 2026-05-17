import prisma, { Prisma } from '@poveroh/prisma'
import type {
    CreateSubscriptionRequest,
    SubscriptionData,
    SubscriptionFilters,
    UpdateSubscriptionRequest
} from '@poveroh/types'
import { buildWhere } from '@/src/helpers/filter.helper'

const subscriptionSelect = {
    id: true,
    title: true,
    description: true,
    amount: true,
    currency: true,
    appearanceMode: true,
    appearanceLogoIcon: true,
    appearanceIconColor: true,
    firstPayment: true,
    cycleNumber: true,
    cyclePeriod: true,
    rememberPeriod: true,
    financialAccountId: true,
    isEnabled: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubscriptionSelect

type SubscriptionRow = Prisma.SubscriptionGetPayload<{ select: typeof subscriptionSelect }>

// Prisma returns Decimal for monetary fields and Date for timestamps; the API contract uses plain JSON primitives.
function toData(row: SubscriptionRow): SubscriptionData {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        amount: row.amount.toNumber(),
        currency: row.currency,
        appearanceMode: row.appearanceMode,
        appearanceLogoIcon: row.appearanceLogoIcon,
        appearanceIconColor: row.appearanceIconColor,
        firstPayment: row.firstPayment.toISOString(),
        cycleNumber: row.cycleNumber.toNumber(),
        cyclePeriod: row.cyclePeriod,
        rememberPeriod: row.rememberPeriod,
        financialAccountId: row.financialAccountId,
        isEnabled: row.isEnabled,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
    }
}

export class SubscriptionRepository {
    // Creates a subscription owned by the authenticated user.
    async create(userId: string, id: string, payload: CreateSubscriptionRequest): Promise<SubscriptionData> {
        const row = await prisma.subscription.create({
            data: { ...payload, id, userId },
            select: subscriptionSelect
        })
        return toData(row)
    }

    // Updates are scoped by user and visible subscription.
    async update(userId: string, id: string, payload: UpdateSubscriptionRequest): Promise<void> {
        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: payload
        })
    }

    // Soft delete preserves recurring payment history.
    async softDelete(userId: string, id: string, deletedAt: Date): Promise<void> {
        await prisma.subscription.update({
            where: { id, userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Bulk deletes are scoped to the current user's visible subscriptions.
    async softDeleteAll(userId: string, deletedAt: Date): Promise<void> {
        await prisma.subscription.updateMany({
            where: { userId, deletedAt: null },
            data: { deletedAt }
        })
    }

    // Reads require ownership and soft-delete scope.
    async findById(userId: string, id: string): Promise<SubscriptionData | null> {
        const row = await prisma.subscription.findFirst({
            where: { id, userId, deletedAt: null },
            select: subscriptionSelect
        })
        return row ? toData(row) : null
    }

    // Filtering and pagination stay inside the repository.
    async findMany(
        userId: string,
        filters: SubscriptionFilters,
        skip: number,
        take: number
    ): Promise<SubscriptionData[]> {
        const where = buildWhere({ ...filters, deletedAt: null, userId }, ['title', 'description'])

        const rows = await prisma.subscription.findMany({
            where,
            select: subscriptionSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })
        return rows.map(toData)
    }
}
