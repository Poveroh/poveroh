import { contextService, type ContextService } from './context.service'
import { MediaService } from './media.service'

/**
 * BaseService provides common functionality for all services, such as user context and file handling.
 * It should be extended by all specific service implementations to ensure consistent behavior and access to shared utilities.
 */
export class BaseService {
    protected readonly context: ContextService

    /**
     * Constructs a service facade that composes request context and media handling for child services.
     * @param location An optional string parameter that specifies the location or category for organizing files in the media storage. This can be used to differentiate files based on the service or module that is handling them, allowing for better organization and easier retrieval of files associated with specific parts of the application. If no location is provided, it defaults to 'unknown', which can be useful for catching any files that are not properly categorized.
     */
    constructor(protected readonly location: string = 'unknown') {
        this.context = contextService
    }

    // Reads the authenticated user ID from the active request context for user-scoped queries.
    protected getUserId(): string {
        return this.context.getCurrentUserId()
    }

    // Stores uploaded files under the current user and service location.
    protected async saveFile(entityId: string, file: Express.Multer.File): Promise<string> {
        return this.media.saveFile(entityId, file)
    }

    /**
     * Builds media handling with the active request user so uploads follow context changes made during a request.
     */
    protected get media(): MediaService {
        return new MediaService(this.context.currentUser.id, this.location)
    }
}
