import { Prisma } from '@poveroh/prisma'
import type {
    AssetData,
    AssetTransactionData,
    AssetTransactionTypeEnum,
    AssetTypeEnum,
    CollectibleAsset,
    InsuranceAsset,
    MarketableAsset,
    MarketableAssetClassEnum,
    PrivateDealAsset,
    RealEstateAsset,
    VehicleAsset
} from '@poveroh/types'

export const assetInclude = {
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true,
    transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'desc' as const }
    }
} satisfies Prisma.AssetInclude

export type AssetWithRelations = Prisma.AssetGetPayload<{ include: typeof assetInclude }>

type AssetPosition = NonNullable<AssetData['position']>
type AssetSubtypeKey = 'marketable' | 'realEstate' | 'collectible' | 'privateDeal' | 'vehicle' | 'insurance'

// Normalizes nullable dates into ISO strings so API responses stay stable.
export function toIsoString(value: Date | string | null | undefined): string | null {
    if (!value) return null
    return value instanceof Date ? value.toISOString() : value
}

// Converts a Prisma Decimal to a plain number; returns null if the input is null/undefined.
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number | null {
    if (value == null) return null
    return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value)
}

// Returns the subtype payload key for the given asset type, or null for types without a subtype.
export function getSubtypeKeyByAssetType(type: MarketableAssetClassEnum): AssetSubtypeKey | null {
    switch (type) {
        case 'STOCK':
        case 'BOND':
        case 'ETF':
        case 'MUTUAL_FUND':
        case 'CRYPTOCURRENCY':
            return 'marketable'
        case 'REAL_ESTATE':
            return 'realEstate'
        case 'COLLECTIBLE':
            return 'collectible'
        case 'VEHICLE':
            return 'vehicle'
        case 'INSURANCE_POLICY':
            return 'insurance'
        case 'PRIVATE_EQUITY':
        case 'VENTURE_CAPITAL':
        case 'PRIVATE_DEBT':
        case 'P2P_LENDING':
            return 'privateDeal'
        default:
            return null
    }
}

// Returns true for asset types that use the marketable subtype (symbol-identified instruments).
export function isMarketableType(type: MarketableAssetClassEnum): boolean {
    return getSubtypeKeyByAssetType(type) === 'marketable'
}

// Applies business semantics to positive quantities so SELL-like rows reduce the position.
function normalizeQuantityDelta(type: AssetTransactionTypeEnum, quantityChange: number | null): number {
    if (quantityChange == null) return 0

    const absoluteQuantity = Math.abs(quantityChange)
    switch (type) {
        case 'SELL':
        case 'WITHDRAWAL':
        case 'DISTRIBUTION':
            return absoluteQuantity * -1
        default:
            return absoluteQuantity
    }
}

// Builds transaction-derived position metrics for each asset.
export function buildPositionMap(transactions: AssetTransactionData[]): Map<string, AssetPosition> {
    const positions = new Map<string, AssetPosition>()

    for (const transaction of transactions) {
        const current = positions.get(transaction.assetId) ?? {
            quantity: 0,
            investedAmount: 0,
            proceedsAmount: 0,
            netContribution: 0,
            averageCost: null,
            realizedCashFlow: 0,
            lastTransactionAt: null
        }

        const quantityDelta = normalizeQuantityDelta(transaction.type, transaction.quantityChange)
        const totalAmount = transaction.totalAmount ?? 0
        const fees = transaction.fees ?? 0
        const taxes = transaction.taxAmount ?? 0

        current.quantity += quantityDelta

        switch (transaction.type) {
            case 'BUY':
            case 'DEPOSIT':
            case 'CAPITAL_CALL':
                current.investedAmount += totalAmount
                current.netContribution += totalAmount
                break
            case 'SELL':
            case 'WITHDRAWAL':
            case 'DISTRIBUTION':
                current.proceedsAmount += totalAmount
                current.netContribution -= totalAmount
                break
            case 'DIVIDEND':
            case 'INTEREST':
                current.realizedCashFlow += totalAmount
                break
            default:
                break
        }

        current.realizedCashFlow -= fees + taxes
        current.lastTransactionAt =
            !current.lastTransactionAt || current.lastTransactionAt < transaction.date
                ? transaction.date
                : current.lastTransactionAt
        current.averageCost = current.quantity > 0 ? current.investedAmount / current.quantity : null

        positions.set(transaction.assetId, current)
    }

    return positions
}
