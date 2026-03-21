/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionDataResponse } from './TransactionDataResponse'
export type GetTransactionResponse = {
    /**
     * Always true for success responses
     */
    success: boolean
    /**
     * Optional success message
     */
    message?: string
    data?: TransactionDataResponse
}
