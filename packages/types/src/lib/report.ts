// ChartRange type - used in UI for chart filtering
export type ChartRange =
    | '1D'
    | 'WTD'
    | '7D'
    | 'MTD'
    | 'LM'
    | '30D'
    | '90D'
    | '180D'
    | 'YTD'
    | '365D'
    | '5Y'
    | '10Y'
    | 'ALL'

// Chart ranges shown in the per-account balance card period selector
export const ACCOUNT_RANGES: ChartRange[] = ['7D', '30D', '90D', '180D', '365D', 'ALL']

// Signed balance variation over a chart period, used by the account balance card header
export type AccountVariation = {
    delta: number
    deltaPct: number
    isPositive: boolean
}
