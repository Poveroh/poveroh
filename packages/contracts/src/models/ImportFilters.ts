/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DateFilter } from './DateFilter'
import type { ImportParamsId } from './ImportParamsId'
import type { StringFilter } from './StringFilter'
export type ImportFilters = {
    id?: ImportParamsId
    title?: StringFilter
    date?: DateFilter
    includeTransactions?: boolean
}
