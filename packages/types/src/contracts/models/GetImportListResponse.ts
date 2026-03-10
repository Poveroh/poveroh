/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportDataResponse } from './ImportDataResponse';
export type GetImportListResponse = {
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
    data?: Array<ImportDataResponse>;
};

