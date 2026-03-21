import { MediaHelper } from '@/src/helpers/media.helper'

/**
 * BaseService class that provides common functionality for all services, such as retrieving the user ID from the request context. This allows all service methods to automatically have access to the authenticated user's ID without needing to pass it explicitly in each method call.
 * The constructor of the BaseService requires a user ID, which is typically retrieved from the request context in the controllers before initializing the service. This ensures that all services that extend BaseService have access to the user ID for performing user-specific operations.
 */
export class BaseService {
    private userId: string | null
    private location: string

    /**
     * Initializes the BaseService with the user ID from the request context
     * @param userId The ID of the authenticated user
     * @throws An error if the user ID is not provided or is invalid, ensuring that all services extending BaseService are properly initialized with a valid user ID
     */
    constructor(userId: string, location: string) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('User ID is required to initialize the service')
        }

        this.userId = userId
        this.location = location || 'unknown'
    }

    /**
     * Retrieves the user ID from the service instance, which is set during initialization.
     * This method can be used by all services that extend BaseService to access the authenticated user's ID for performing user-specific operations.
     * @returns The user ID of the authenticated user
     * @throws An error if the user ID is not found in the service instance, which indicates a problem with service initialization
     */
    getUserId(): string {
        if (!this.userId) {
            throw new Error('User ID not found in request context')
        }

        return this.userId
    }

    /**
     * Saves a file for a financial account with the specified ID for the authenticated user
     * @param id The ID of the financial account to save the file for
     * @param file The file to be saved
     */
    async saveFile(id: string, file: Express.Multer.File): Promise<string> {
        const userId = this.getUserId()

        return await MediaHelper.handleUpload(file, `${userId}/${this.location}/${id}`)
    }
}
