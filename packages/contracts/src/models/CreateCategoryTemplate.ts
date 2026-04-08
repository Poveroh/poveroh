/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Subcategory } from './Subcategory'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type CreateCategoryTemplate = {
    title: string
    for: TransactionActionEnum
    icon: string
    color?: string
    subcategories?: Array<Subcategory>
}
