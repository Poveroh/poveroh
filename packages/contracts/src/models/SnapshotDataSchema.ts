/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SnapshotAccountBalance } from './SnapshotAccountBalance'
import type { SnapshotAssetValue } from './SnapshotAssetValue'
export type SnapshotDataSchema = {
    id: string
    snapshotDate: string
    note: string | null
    totalCash: number
    totalInvestments: number
    totalNetWorth: number
    accountBalances: Array<SnapshotAccountBalance>
    assetValues: Array<SnapshotAssetValue>
    createdAt: string
    updatedAt: string
}
