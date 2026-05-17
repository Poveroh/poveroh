import { MediaHelper } from '@/helpers'
import { ContextService } from './context.service'

/**
 * BaseService provides common functionality for all services, such as user context and file handling.
 * It should be extended by all specific service implementations to ensure consistent behavior and access to shared utilities.
 */
export class BaseService extends ContextService {
    /**
     * Constructs a new instance of the BaseService class, initializing it with a specific location identifier. This location can be used to organize files in the media storage based on the service or module that is using the BaseService. By providing a location, developers can ensure that files are stored in a structured manner, making it easier to manage and retrieve them later. The constructor also calls the parent class's constructor to ensure that the context management functionality is properly initialized for any service that extends BaseService.
     * @param location An optional string parameter that specifies the location or category for organizing files in the media storage. This can be used to differentiate files based on the service or module that is handling them, allowing for better organization and easier retrieval of files associated with specific parts of the application. If no location is provided, it defaults to 'unknown', which can be useful for catching any files that are not properly categorized.
     */
    constructor(private readonly location: string = 'unknown') {
        super()
    }

    /**
     * Saves a file to the media storage, associating it with the current user and service location.
     * @param id The identifier to associate with the file, typically used to organize files by entity or purpose within the service's media storage structure
     * @param file The file object received from an Express Multer upload, containing the file data and metadata
     * @returns A promise that resolves to the URL or identifier of the saved file in the media storage, which can be used for future retrieval or reference
     */
    async saveFile(id: string, file: Express.Multer.File): Promise<string> {
        return await MediaHelper.handleUpload(file, `${this.getCurrentUserId()}/${this.location}/${id}`)
    }
}
