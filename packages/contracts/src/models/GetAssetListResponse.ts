/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssetData } from './AssetData'
export type GetAssetListResponse = {
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
    data: Array<AssetData>
}
