/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DateFilter } from './DateFilter'
import type { StringFilter } from './StringFilter'
import type { UserActivityTypeEnum } from './UserActivityTypeEnum'
export type UserActivityFilters = {
    type?: UserActivityTypeEnum
    entityType?: StringFilter
    entityId?: StringFilter
    createdAt?: DateFilter
}
