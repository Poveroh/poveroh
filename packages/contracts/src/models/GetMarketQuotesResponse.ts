/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MarketQuote } from './MarketQuote'
export type GetMarketQuotesResponse = {
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
    data: Array<MarketQuote>
}
