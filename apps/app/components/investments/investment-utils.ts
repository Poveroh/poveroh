import type { AssetData, AssetTypeEnum } from '@poveroh/types'

export type AssetGroup = {
    key: string
    titleKey: string
    types: AssetTypeEnum[]
}

export type InvestmentSummaryLabels = {
    balance: string
    live: string
}

export type AssetTableLabels = {
    name: string
    year: string
    buyDate: string
    quantity: string
    price: string
    weight: string
    total: string
}

export const YEAR_FILTERS = ['2026', '2025', '2024']

export const ASSET_GROUPS: AssetGroup[] = [
    { key: 'stock', titleKey: 'investments.assets.groups.stock', types: ['STOCK'] },
    { key: 'bond', titleKey: 'investments.assets.groups.bond', types: ['BOND'] },
    { key: 'etf', titleKey: 'investments.assets.groups.etf', types: ['ETF', 'MUTUAL_FUND'] },
    { key: 'crypto', titleKey: 'investments.assets.groups.crypto', types: ['CRYPTOCURRENCY'] },
    { key: 'property', titleKey: 'investments.assets.groups.property', types: ['REAL_ESTATE'] },
    { key: 'vehicle', titleKey: 'investments.assets.groups.vehicle', types: ['VEHICLE'] },
    {
        key: 'valuables',
        titleKey: 'investments.assets.groups.valuables',
        types: [
            'COLLECTIBLE',
            'PRIVATE_EQUITY',
            'VENTURE_CAPITAL',
            'PRIVATE_DEBT',
            'P2P_LENDING',
            'INSURANCE_POLICY',
            'OTHER'
        ]
    }
]

export const formatCurrency = (value: number, currency = 'EUR') =>
    new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
    }).format(value)

export const getAssetCurrentValue = (asset: AssetData) => asset.currentValue ?? asset.position?.netContribution ?? 0

export const getPortfolioValue = (assets: AssetData[]) =>
    assets.reduce((sum, asset) => sum + getAssetCurrentValue(asset), 0)

export const getLiveAssetsCount = (assets: AssetData[]) =>
    assets.filter(asset => asset.marketable?.lastPriceSync).length
