import type { AssetTypeEnum, CurrencyEnum, MarketStateEnum } from '@poveroh/types'

/**
 * Normalizes a provider-specific instrument "type" string into our AssetTypeEnum.
 * Providers use wildly different vocabularies (Yahoo "EQUITY"/"CRYPTOCURRENCY",
 * Finnhub "Common Stock", Massive "CS"/"ETF"), so we match on a lowercased token
 * and fall back to STOCK for anything equity-like we don't explicitly recognize.
 * @param raw The provider's raw type label.
 * @returns The normalized asset type.
 */
export function mapAssetType(raw?: string | null): AssetTypeEnum {
    const value = (raw ?? '').toLowerCase()

    if (value.includes('etf')) return 'ETF'
    if (value.includes('crypto')) return 'CRYPTO'
    if (value.includes('bond')) return 'BOND'
    if (value.includes('mutual') || value === 'mf' || value.includes('fund')) return 'MUTUAL_FUND'

    return 'STOCK'
}

/**
 * Coerces a provider currency code into our CurrencyEnum, defaulting to USD when
 * the provider omits the currency or returns an unexpected value.
 * @param raw The provider currency code (e.g. "usd", "EUR").
 * @returns The normalized currency code.
 */
export function mapCurrency(raw?: string | null): CurrencyEnum {
    const value = (raw ?? '').toUpperCase().trim()
    if (!value) return 'USD' as CurrencyEnum

    return value as CurrencyEnum
}

/**
 * Maps a provider-specific market state string into our MarketStateEnum.
 * @param raw The provider's raw market state string.
 * @returns The normalized market state.
 */
export function mapMarketState(raw?: string): MarketStateEnum {
    switch ((raw ?? '').toUpperCase()) {
        case 'REGULAR':
            return 'OPEN'
        case 'PRE':
        case 'PREPRE':
            return 'PRE_MARKET'
        case 'POST':
        case 'POSTPOST':
            return 'POST_MARKET'
        case 'CLOSED':
            return 'CLOSED'
        default:
            return 'UNKNOWN'
    }
}
