export interface ISnapshotBase {
    snapshotDate: Date
    note?: string | null
    totalCash: number
    totalInvestments: number
    totalNetWorth: number
}

export interface ISnapshot extends ISnapshotBase {
    id: string
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

export interface ISnapshotAccountBalanceBase {
    snapshotId: string
    accountId: string
    balance: number
}

export interface ISnapshotAssetValueBase {
    snapshotId: string
    assetId: string
    quantity?: number | null
    unitPrice?: number | null
    totalValue: number
}
