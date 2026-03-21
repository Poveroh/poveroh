import prisma from '@poveroh/prisma'
import { NotFoundError } from '@/src/utils'
import { UpdateUserRequest, User } from '@poveroh/types'
import { BaseService } from './base.service'

/**
 * Service class for managing users, including retrieving and updating user data
 * All methods automatically retrieve the user ID from the request context when needed.
 */
export class UserService extends BaseService {
    /**
     * Initializes the UserService with the user ID from the request context
     * @param userId The ID of the authenticated user
     */
    constructor(userId: string) {
        super(userId, 'user')
    }

    /**
     * Retrieves a user
     * @param id The ID of the user to retrieve
     * @returns The user data response
     */
    async getUser(id: string): Promise<User | null> {
        return (await prisma.user.findUnique({
            where: { id }
        })) as unknown as User | null
    }

    /**
     * Retrieves a user by email
     * @param email The email of the user to retrieve
     * @returns The user data response
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return (await prisma.user.findUnique({
            where: { email }
        })) as unknown as User | null
    }

    /**
     * Updates a user by ID
     * @param id The ID of the user to update
     * @param payload The data to update the user with
     * @returns The updated user data response
     */
    async updateUser(id: string, payload: UpdateUserRequest): Promise<void> {
        if (!payload) {
            throw new NotFoundError('Payload not provided')
        }

        await prisma.user.update({
            where: { id },
            data: payload
        })
    }
}
