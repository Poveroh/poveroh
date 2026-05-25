import prisma, { Prisma } from '@poveroh/prisma'
import type { CreateUserActivityRequest, UserActivityData, UserActivityFilters } from '@poveroh/types'
import { buildWhere } from '@/helpers'

const userActivitySelect = {
    id: true,
    type: true,
    entityType: true,
    entityId: true,
    metadata: true,
    userAgent: true,
    createdAt: true
} satisfies Prisma.UserActivitySelect

export class UserActivityRepository {
    /**
     * Persists a new activity entry for the specified user.
     * @param userId The unique identifier of the user the activity belongs to.
     * @param payload The activity payload describing the event being recorded.
     * @returns A promise that resolves to the newly persisted activity row.
     */
    async create(userId: string, payload: CreateUserActivityRequest): Promise<UserActivityData> {
        return (await prisma.userActivity.create({
            data: {
                userId,
                type: payload.type,
                entityType: payload.entityType ?? null,
                entityId: payload.entityId ?? null,
                metadata: (payload.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
                userAgent: payload.userAgent ?? null
            },
            select: userActivitySelect
        })) as unknown as UserActivityData
    }

    /**
     * Finds the activities belonging to the specified user, applying the supplied filters and pagination window.
     * @param userId The unique identifier of the user whose activities should be returned.
     * @param filters Optional filters narrowing the result set (type, entity, date range).
     * @param skip The number of rows to skip for pagination.
     * @param take The maximum number of rows to return.
     * @returns A promise that resolves to the list of user activities, ordered by most recent first.
     */
    async findMany(
        userId: string,
        filters: UserActivityFilters,
        skip: number,
        take: number
    ): Promise<UserActivityData[]> {
        const where = buildWhere({ ...filters, userId }, [])

        return (await prisma.userActivity.findMany({
            where,
            select: userActivitySelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take
        })) as unknown as UserActivityData[]
    }
}
