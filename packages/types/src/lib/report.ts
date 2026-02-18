export interface INetWorthEvolutionDataPoint {
    date: string
    totalNetWorth: number
}

export interface INetWorthEvolutionReport {
    totalNetWorth: number
    dataPoints: INetWorthEvolutionDataPoint[]
}

export type ChartRange = '1D' | 'WTD' | '7D' | 'MTD' | 'LM' | '30D' | '90D' | 'YTD' | '365D' | '5Y' | '10Y' | 'ALL'
