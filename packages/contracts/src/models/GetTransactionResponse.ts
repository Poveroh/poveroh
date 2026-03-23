/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionData } from './TransactionData'
export type GetTransactionResponse = {
    /**
     * Indicates if the request was successful
     */
    success: boolean
    /**
     * Optional success message
     */
    message: string
    data: TransactionData
}
