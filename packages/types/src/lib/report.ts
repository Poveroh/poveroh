export interface INetWorthEvolutionDataPoint {
    date: string
    totalNetWorth: number
}

export interface INetWorthEvolutionReport {
    totalNetWorth: number
    dataPoints: INetWorthEvolutionDataPoint[]
}
