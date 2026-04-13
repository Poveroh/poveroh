/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionActionEnum } from './TransactionActionEnum'
export type CreateCategoryTemplateSchema = {
    title: string
    for: TransactionActionEnum
    icon: string
    color?: string
    subcategories?: Array<{
        title: string
        icon: string
    }>
}
