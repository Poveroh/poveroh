/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DateFilter } from './DateFilter'
import type { StringFilter } from './StringFilter'
import type { TransactionActionEnum } from './TransactionActionEnum'
import type { TransactionParamsId } from './TransactionParamsId'
export type TransactionFilters = {
    id?: TransactionParamsId
    title?: StringFilter
    note?: StringFilter
    action?: TransactionActionEnum
    categoryId?: string
    subcategoryId?: string
    financialAccountId?: string
    date?: DateFilter
}
