export type FinnhubSearchResult = {
    symbol?: string
    displaySymbol?: string
    description?: string
    type?: string
}

export type FinnhubSearchResponse = {
    count?: number
    result?: FinnhubSearchResult[]
}

export type FinnhubQuoteResponse = {
    c?: number // current price
    dp?: number // change percent
    t?: number // unix timestamp (seconds)
}
