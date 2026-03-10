/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialAccountDataResponse } from './FinancialAccountDataResponse';
export type GetFinancialAccountListResponse = {
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
    data?: Array<FinancialAccountDataResponse>;
};

