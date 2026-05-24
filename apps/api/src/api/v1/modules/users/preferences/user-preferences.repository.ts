import prisma from '@poveroh/prisma'
import type { UpdateUserPreferencesRequest, UserPreferences } from '@poveroh/types'

export class UserPreferencesRepository {
    /**
     * Finds the preferences row for a given user.
     * @param userId The unique identifier of the user whose preferences should be retrieved.
     * @returns A promise resolving to the user preferences, or null if no row exists yet.
     */
    async findByUserId(userId: string): Promise<UserPreferences | null> {
        return (await prisma.userPreferences.findUnique({
            where: { userId }
        })) as unknown as UserPreferences | null
    }

    /**
     * Creates a default preferences row for the given user.
     * @param userId The unique identifier of the user the row belongs to.
     * @returns A promise resolving to the freshly-created preferences row populated with schema defaults.
     */
    async createDefault(userId: string): Promise<UserPreferences> {
        return (await prisma.userPreferences.create({
            data: { userId }
        })) as unknown as UserPreferences
    }

    /**
     * Upserts the preferences row for the given user, merging the supplied fields with the existing record or creating defaults plus overrides if no row exists.
     * @param userId The unique identifier of the user whose preferences should be persisted.
     * @param payload The preference fields to write.
     * @returns A promise resolving to the updated preferences row.
     */
    async upsert(userId: string, payload: UpdateUserPreferencesRequest): Promise<UserPreferences> {
        return (await prisma.userPreferences.upsert({
            where: { userId },
            update: payload,
            create: { userId, ...payload }
        })) as unknown as UserPreferences
    }
}
