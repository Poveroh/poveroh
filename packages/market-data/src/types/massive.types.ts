export type MassiveTicker = {
    ticker?: string
    name?: string
    market?: string
    primary_exchange?: string
    currency_symbol?: string
    currency_name?: string
    type?: string
}

export type MassiveTickersResponse = {
    results?: MassiveTicker[]
}

export type MassiveLastTradeResponse = {
    results?: {
        p?: number // trade price
        t?: number // SIP timestamp (nanoseconds)
    }
}
