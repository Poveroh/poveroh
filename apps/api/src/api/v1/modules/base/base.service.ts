import { contextService, type ContextService } from './context.service'
import { MediaService } from './media.service'
import { RedisHelper } from '@poveroh/redis'
import { UserActivityService } from '../users/activities/user-activity.service'

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

    /**
     * Provides access to the user-activity service so child services can record audit-log entries
     * (e.g. `await this.activities.record({ type: 'CATEGORY_CREATED', entityId })`).
     * @returns A fresh UserActivityService instance bound to the current request context.
     */
    protected get activities(): UserActivityService {
        return new UserActivityService()
    }

    /**
     * Provides access to Redis helper methods for caching and data storage.
     * @returns A new instance of RedisHelper for interacting with Redis.
     */
    protected get redis(): RedisHelper {
        return new RedisHelper()
    }
}
