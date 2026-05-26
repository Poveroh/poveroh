/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DateFilter } from './DateFilter'
import type { UserActivityActionEnum } from './UserActivityActionEnum'
import type { UserActivityEntityEnum } from './UserActivityEntityEnum'
export type UserActivityFilters = {
    entityType?: UserActivityEntityEnum
    action?: UserActivityActionEnum
    entityId?: string
    createdAt?: DateFilter
}
