/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryDataResponse } from './CategoryDataResponse';
export type GetCategoryListResponse = {
    /**
     * Always true for success responses
     */
    success: boolean;
    /**
     * Optional success message
     */
    message?: string;
    /**
     * Response data
     */
    data?: Array<CategoryDataResponse>;
};

