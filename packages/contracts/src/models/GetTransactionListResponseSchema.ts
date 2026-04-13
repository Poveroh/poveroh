/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionListData } from './TransactionListData'
export type GetTransactionListResponseSchema = {
    /**
     * Indicates if the request was successful
     */
    success: boolean
    /**
     * Optional success message
     */
    message: string
    data: TransactionListData
}
