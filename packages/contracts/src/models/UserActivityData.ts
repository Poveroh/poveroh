/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserActivityTypeEnum } from './UserActivityTypeEnum'
export type UserActivityData = {
    id: string
    type: UserActivityTypeEnum
    entityType: string | null
    entityId: string | null
    metadata: Record<string, any> | null
    userAgent: string | null
    createdAt: string
}
