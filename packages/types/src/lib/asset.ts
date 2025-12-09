import { Currencies } from './currency.js'

export interface IAssetBase {
    title: string
    description?: string | null
    type: AssetType
    currency: Currencies
}

export interface IAsset extends IAssetBase {
    id: string
    userId: string
    createdAt: string
    updatedAt: string
}

export interface IMarketableAsset {
    id: string
    assetId: string
    symbol?: string | null
    isin?: string | null
}

export interface IRealEstateAsset {
    id: string
    assetId: string
    address?: string | null
    purchasePrice?: number | null
    purchaseDate?: string | null
    currentValue?: number | null
}

export interface ICollectibleAsset {
    id: string
    assetId: string
    acquisitionCost?: number | null
    acquisitionDate?: string | null
    appraisalValue?: number | null
    appraisalDate?: string | null
}

export interface IPrivateDealAsset {
    id: string
    assetId: string
    committedAmount?: number | null
    calledAmount?: number | null
    latestNav?: number | null
    navDate?: string | null
}

export interface IInsuranceAsset {
    id: string
    assetId: string
    policyNumber?: string | null
    premiumPaid?: number | null
    surrenderValue?: number | null
}

export interface IAssetTransaction {
    id: string
    assetId: string
    date: string
    quantityChange: number
    unitPrice?: number | null
    totalAmount?: number | null
    fees?: number | null
    note?: string | null
}

export interface IAssetTransactionBase {
    assetId: string
    date: string
    quantityChange: number
    unitPrice?: number | null
    totalAmount?: number | null
    fees?: number | null
    note?: string | null
}

export enum AssetType {
    STOCK = 'STOCK',
    BOND = 'BOND',
    ETF = 'ETF',
    MUTUAL_FUND = 'MUTUAL_FUND',
    CRYPTOCURRENCY = 'CRYPTOCURRENCY',
    REAL_ESTATE = 'REAL_ESTATE',
    COLLECTIBLE = 'COLLECTIBLE',
    PRIVATE_EQUITY = 'PRIVATE_EQUITY',
    VENTURE_CAPITAL = 'VENTURE_CAPITAL',
    PRIVATE_DEBT = 'PRIVATE_DEBT',
    P2P_LENDING = 'P2P_LENDING',
    INSURANCE_POLICY = 'INSURANCE_POLICY',
    AGRICULTURAL_LAND = 'AGRICULTURAL_LAND',
    OTHER = 'OTHER'
}
