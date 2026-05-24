import type { Request, Response } from 'express'
import type { UpdateUserPreferencesRequest, UserPreferences } from '@poveroh/types'
import { ResponseHelper, parseRequestBody } from '@/utils'
import { UpdateUserPreferencesSchemaRequest } from '@poveroh/schemas'
import { UserPreferencesService } from './user-preferences.service'

export class UserPreferencesController {
    private readonly preferencesService = new UserPreferencesService()

    // GET /me/preferences
    async getAuthenticatedUserPreferences(req: Request, res: Response) {
        try {
            const preferences = await this.preferencesService.getPreferences()
            return ResponseHelper.success<UserPreferences>(res, preferences)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // PATCH /me/preferences
    async updateAuthenticatedUserPreferences(req: Request, res: Response) {
        try {
            const payload = parseRequestBody(
                UpdateUserPreferencesSchemaRequest,
                req.body
            ) as unknown as UpdateUserPreferencesRequest

            const preferences = await this.preferencesService.updatePreferences(payload)

            return ResponseHelper.success<UserPreferences>(res, preferences)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
