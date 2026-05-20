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
     * @param location An optional string parameter that specifies the location or category for organizing files in the media storage.
     */
    constructor(protected readonly location: string = 'unknown') {
        this.context = contextService
    }

    /**
     * Builds media handling with the active request user so uploads follow context changes made during a request.
     * @returns An instance of MediaService configured with the current user's context and the service location.
     */
    protected get media(): MediaService {
        return new MediaService(this.context.currentUser.id, this.location)
    }
}
