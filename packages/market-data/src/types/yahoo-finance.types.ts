export type YahooSearchQuote = {
    symbol?: string
    shortname?: string
    longname?: string
    exchange?: string
    exchDisp?: string
    quoteType?: string
    currency?: string
}

export type YahooSearchResponse = {
    quotes?: YahooSearchQuote[]
}

export type YahooChartMeta = {
    symbol?: string
    currency?: string
    regularMarketPrice?: number
    previousClose?: number
    chartPreviousClose?: number
    marketState?: string
    fullExchangeName?: string
    exchangeName?: string
}

export type YahooChartResponse = {
    chart?: {
        result?: Array<{ meta?: YahooChartMeta }> | null
    }
}
