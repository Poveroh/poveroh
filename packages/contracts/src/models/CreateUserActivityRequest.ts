/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserActivityActionEnum } from './UserActivityActionEnum'
import type { UserActivityEntityEnum } from './UserActivityEntityEnum'
export type CreateUserActivityRequest = {
    entityType: UserActivityEntityEnum
    action: UserActivityActionEnum
    entityId?: string | null
    metadata?: Record<string, any> | null
    userAgent?: string | null
}
