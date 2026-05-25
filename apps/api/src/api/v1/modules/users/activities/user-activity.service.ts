import type { CreateUserActivityRequest, UserActivityData, UserActivityFilters } from '@poveroh/types'
import { contextService, type ContextService } from '../../base/context.service'
import { UserActivityRepository } from './user-activity.repository'

/**
 * Service responsible for reading and recording the audit-log activities of the authenticated user.
 * Intentionally does NOT extend BaseService so it can be consumed from inside BaseService without creating a circular import.
 */
export class UserActivityService {
    private readonly activityRepository = new UserActivityRepository()
    protected readonly context: ContextService = contextService

    /**
     * Retrieves a paginated list of activities for the authenticated user, applying the supplied filters.
     * @param filters Optional filters to narrow the activity list (type, entity, date range).
     * @param skip The number of rows to skip for pagination.
     * @param take The maximum number of rows to return.
     * @returns A promise resolving to the list of user activities ordered by most recent first.
     */
    async getActivities(filters: UserActivityFilters, skip: number, take: number): Promise<UserActivityData[]> {
        return this.activityRepository.findMany(this.context.currentUser.id, filters, skip, take)
    }

    /**
     * Records a new activity for the authenticated user. Intended to be called from other services after a successful workflow.
     * Activity recording is best-effort: failures are swallowed so they cannot break the parent business transaction.
     * @param payload The activity payload describing the event being recorded.
     * @returns A promise that resolves to the newly persisted activity, or null when recording failed.
     */
    async record(payload: CreateUserActivityRequest): Promise<UserActivityData | null> {
        try {
            return await this.activityRepository.create(this.context.currentUser.id, payload)
        } catch {
            return null
        }
    }
}
