/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubcategoryData } from './SubcategoryData'
export type GetSubcategoryListResponseSchema = {
    /**
     * Indicates if the request was successful
     */
    success: boolean
    /**
     * Optional success message
     */
    message: string
    /**
     * Response data
     */
    data: Array<SubcategoryData>
}
