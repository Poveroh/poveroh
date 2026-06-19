import type { UpdateUserPreferencesRequest, UserPreferences } from '@poveroh/types'
import { BadRequestError } from '@/utils'
import { BaseService } from '../../base/base.service'
import { UserPreferencesRepository } from './user-preferences.repository'
import { eventBus } from '../../../worker/events/event-bus'

/**
 * Service responsible for managing user preferences (currency, language, date format, timezone, etc.).
 * Operates on the authenticated user retrieved from the request context.
 */
export class UserPreferencesService extends BaseService {
    private readonly preferencesRepository = new UserPreferencesRepository()

    constructor() {
        super('user-preferences')
    }

    /**
     * Retrieves the preferences row for the authenticated user, lazily creating one with schema defaults
     * the first time it is requested so callers always get a populated object.
     * @returns A promise resolving to the user preferences for the authenticated user.
     */
    async getPreferences(): Promise<UserPreferences> {
        const userId = this.context.currentUser.id

        const existing = await this.preferencesRepository.findByUserId(userId)
        if (existing) return existing

        return this.preferencesRepository.createDefault(userId)
    }

    /**
     * Updates the preferences row for the authenticated user with the supplied partial payload.
     * If no row exists yet, one is created with defaults plus the supplied overrides.
     * @param payload The partial preferences payload to merge with the stored preferences.
     * @returns A promise resolving to the updated preferences row.
     */
    async updatePreferences(payload: UpdateUserPreferencesRequest): Promise<UserPreferences> {
        if (!payload) {
            throw new BadRequestError('Payload not provided')
        }

        const userId = this.context.currentUser.id

        const data = await this.preferencesRepository.upsert(userId, payload)
        await eventBus.emit('user-preferences.updated', { userId, data })

        return data
    }
}
