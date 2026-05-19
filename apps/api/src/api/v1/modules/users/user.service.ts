import type { UpdateUserRequest, User } from '@poveroh/types'
import { BadRequestError } from '@/utils'
import { BaseService } from '../base/base.service'
import { UserRepository } from './user.repository'

/**
 * Service class for managing users, including retrieving and updating user data.
 * All methods automatically retrieve the user ID from the request context when needed.
 */
export class UserService extends BaseService {
    private readonly userRepository = new UserRepository()

    constructor() {
        super('user')
    }

    /**
     * Retrieves a user by its unique identifier.
     * @param id The unique identifier of the user to retrieve.
     * @returns A promise that resolves to the user data, or null when no user is found.
     */
    async getUser(id: string): Promise<User | null> {
        return this.userRepository.findById(id)
    }

    /**
     * Retrieves a user by its email address.
     * @param email The email address of the user to retrieve.
     * @returns A promise that resolves to the user data, or null when no user is found.
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email)
    }

    /**
     * Updates a user identified by the provided id with the fields contained in the payload.
     * @param id The unique identifier of the user to be updated.
     * @param payload The data to update the user with.
     * @returns A promise that resolves when the user has been updated.
     */
    async updateUser(id: string, payload: UpdateUserRequest): Promise<void> {
        if (!payload) {
            throw new BadRequestError('Payload not provided')
        }

        await this.userRepository.update(id, payload)
    }
}
