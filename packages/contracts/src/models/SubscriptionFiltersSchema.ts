/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialAccountTypeEnum } from './FinancialAccountTypeEnum'
import type { StringFilter } from './StringFilter'
import type { SubscriptionParamsId } from './SubscriptionParamsId'
export type SubscriptionFiltersSchema = {
    id?: SubscriptionParamsId
    title?: StringFilter
    description?: StringFilter
    type?: FinancialAccountTypeEnum
}
