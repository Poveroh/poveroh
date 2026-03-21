/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialAccountData } from './FinancialAccountData'
export type CreateFinancialAccountResponse = {
    /**
     * Always true for success responses
     */
    success: boolean
    /**
     * Optional success message
     */
    message?: string
    data?: FinancialAccountData
}
