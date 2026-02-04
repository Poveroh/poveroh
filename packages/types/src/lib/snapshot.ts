export interface ISnapshot {
    id: string
    snapshotDate: string
    note?: string | null
    totalCash: number
    totalInvestments: number
    totalNetWorth: number
    userId: string
}

export interface ISnapshotAccountBalance {
    id: string
    snapshotId: string
    accountId: string
    balance: number
}

export interface ISnapshotAssetValue {
    id: string
    snapshotId: string
    assetId: string
    quantity?: number | null
    unitPrice?: number | null
    totalValue: number
}
