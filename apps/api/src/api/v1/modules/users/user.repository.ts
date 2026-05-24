import prisma from '@poveroh/prisma'
import type { UpdateUserRequest, User } from '@poveroh/types'

export class UserRepository {
    /**
     * Finds a user by its unique identifier, returning the user data including preferences or null when no record exists.
     * @param id The unique identifier of the user to retrieve.
     * @returns A promise that resolves to a User object including preferences, or null if no user is found.
     */
    async findById(id: string): Promise<User | null> {
        return (await prisma.user.findUnique({
            where: { id },
            include: { preferences: true }
        })) as unknown as User | null
    }

    /**
     * Finds a user by its email address, returning the user data including preferences or null when no record exists.
     * @param email The email address of the user to retrieve.
     * @returns A promise that resolves to a User object including preferences, or null if no user is found.
     */
    async findByEmail(email: string): Promise<User | null> {
        return (await prisma.user.findUnique({
            where: { email },
            include: { preferences: true }
        })) as unknown as User | null
    }

    /**
     * Updates a user identified by the provided id with the fields contained in the payload.
     * Preferences are not handled here; use UserPreferencesRepository for that.
     * @param id The unique identifier of the user to be updated.
     * @param payload An object containing the new field values to apply to the user record.
     * @returns A promise that resolves when the user has been updated.
     */
    async update(id: string, payload: UpdateUserRequest): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: payload
        })
    }
}
