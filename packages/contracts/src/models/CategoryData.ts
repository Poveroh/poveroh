/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Subcategory } from './Subcategory'
import type { TransactionActionEnum } from './TransactionActionEnum'
export type CategoryData = {
    id: string
    title: string
    for: TransactionActionEnum
    logoIcon: string
    color?: string
    subcategories?: Array<Subcategory>
    createdAt: string
    updatedAt: string
}
