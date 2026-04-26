import type { AssetTypeEnum, MarketDataProvider, MarketInstrument, MarketQuote } from '@poveroh/types'
import { BadRequestError, InternalServerError } from '@/src/utils'

type SearchMarketInstrumentsParams = {
    providerId?: string
    assetType?: AssetTypeEnum
    q: string
    limit?: number
}

type GetMarketQuotesParams = {
    providerId?: string
    assetType?: AssetTypeEnum
    symbols: string[]
}

type ProviderTransport = MarketDataProvider['transport']

type RawInstrument = {
    providerId: string
    payload: unknown
}

type RawQuote = {
    providerId: string
    payload: unknown
}

interface MarketDataProviderClient {
    getMetadata(): MarketDataProvider
    supportsAssetType(assetType?: AssetTypeEnum): boolean
    searchInstruments(params: SearchMarketInstrumentsParams): Promise<RawInstrument[]>
    getQuotes(params: GetMarketQuotesParams): Promise<RawQuote[]>
    normalizeInstrument(raw: RawInstrument): MarketInstrument | null
    normalizeQuote(raw: RawQuote): MarketQuote | null
}

type MockInstrumentDefinition = {
    providerInstrumentId: string
    symbol: string
    displayName: string
    assetType: AssetTypeEnum
    currency: MarketInstrument['currency']
    exchange: string | null
    market: string | null
    metadata: Record<string, string>
}

type BinanceExchangeInfoResponse = {
    symbols?: Array<{
        symbol: string
        status: string
        baseAsset: string
        quoteAsset: string
    }>
}

type BinanceStreamEnvelope = {
    stream?: string
    data?: {
        s?: string
        c?: string
        P?: string
        E?: number
    }
}

type MinimalWebSocketEventMap = {
    message: { data: string }
    error: Event
    open: Event
}

interface MinimalWebSocket {
    addEventListener<K extends keyof MinimalWebSocketEventMap>(
        type: K,
        listener: (event: MinimalWebSocketEventMap[K]) => void
    ): void
    removeEventListener<K extends keyof MinimalWebSocketEventMap>(
        type: K,
        listener: (event: MinimalWebSocketEventMap[K]) => void
    ): void
    close(): void
}

interface MinimalWebSocketConstructor {
    new (url: string): MinimalWebSocket
}

const DEFAULT_PROVIDER_ID = 'mock-market'

const MOCK_INSTRUMENTS: MockInstrumentDefinition[] = [
    {
        providerInstrumentId: 'AAPL',
        symbol: 'AAPL',
        displayName: 'Apple Inc.',
        assetType: 'STOCK',
        currency: 'USD',
        exchange: 'NASDAQ',
        market: 'US',
        metadata: { region: 'US', assetClass: 'EQUITY' }
    },
    {
        providerInstrumentId: 'VWCE',
        symbol: 'VWCE',
        displayName: 'Vanguard FTSE All-World UCITS ETF',
        assetType: 'ETF',
        currency: 'EUR',
        exchange: 'XETRA',
        market: 'EU',
        metadata: { region: 'GLOBAL', assetClass: 'ETF' }
    },
    {
        providerInstrumentId: 'BTC-EUR',
        symbol: 'BTC-EUR',
        displayName: 'Bitcoin / Euro',
        assetType: 'CRYPTOCURRENCY',
        currency: 'EUR',
        exchange: 'MOCK',
        market: 'CRYPTO',
        metadata: { baseAsset: 'BTC', quoteAsset: 'EUR', assetClass: 'CRYPTO' }
    },
    {
        providerInstrumentId: 'BTP-VALORE',
        symbol: 'BTP-VALORE',
        displayName: 'BTP Valore',
        assetType: 'BOND',
        currency: 'EUR',
        exchange: 'MOT',
        market: 'IT',
        metadata: { region: 'IT', assetClass: 'BOND' }
    },
    {
        providerInstrumentId: 'ETH-EUR',
        symbol: 'ETH-EUR',
        displayName: 'Ethereum / Euro',
        assetType: 'CRYPTOCURRENCY',
        currency: 'EUR',
        exchange: 'MOCK',
        market: 'CRYPTO',
        metadata: { baseAsset: 'ETH', quoteAsset: 'EUR', assetClass: 'CRYPTO' }
    }
]

// Keeps provider metadata consistent in one place across registry, docs, and responses.
const createProviderMetadata = (
    id: string,
    label: string,
    transport: ProviderTransport,
    supportedAssetTypes: AssetTypeEnum[],
    supportsSearch: boolean,
    supportsQuotes: boolean,
    supportsStreaming: boolean
): MarketDataProvider => ({
    id,
    label,
    transport,
    enabled: true,
    supportsSearch,
    supportsQuotes,
    supportsStreaming,
    supportedAssetTypes
})

class MockMarketDataProvider implements MarketDataProviderClient {
    getMetadata(): MarketDataProvider {
        return createProviderMetadata(
            DEFAULT_PROVIDER_ID,
            'Mock Market Provider',
            'HTTP',
            ['STOCK', 'ETF', 'BOND', 'MUTUAL_FUND', 'CRYPTOCURRENCY'],
            true,
            true,
            false
        )
    }

    supportsAssetType(assetType?: AssetTypeEnum) {
        if (!assetType) {
            return true
        }

        return this.getMetadata().supportedAssetTypes.includes(assetType)
    }

    async searchInstruments(params: SearchMarketInstrumentsParams) {
        const normalizedQuery = params.q.trim().toLowerCase()
        const results = MOCK_INSTRUMENTS.filter(instrument => {
            if (params.assetType && instrument.assetType !== params.assetType) {
                return false
            }

            const searchableContent = [
                instrument.symbol,
                instrument.displayName,
                instrument.metadata.baseAsset,
                instrument.metadata.quoteAsset
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchableContent.includes(normalizedQuery)
        }).slice(0, params.limit ?? 20)

        return results.map(result => ({
            providerId: this.getMetadata().id,
            payload: result
        }))
    }

    async getQuotes(params: GetMarketQuotesParams) {
        return params.symbols.map(symbol => ({
            providerId: this.getMetadata().id,
            payload: {
                symbol,
                asOf: new Date().toISOString(),
                price: this.computeDeterministicPrice(symbol),
                changePercent: this.computeDeterministicChange(symbol)
            }
        }))
    }

    normalizeInstrument(raw: RawInstrument): MarketInstrument | null {
        const payload = raw.payload as MockInstrumentDefinition
        return {
            providerId: raw.providerId,
            providerInstrumentId: payload.providerInstrumentId,
            symbol: payload.symbol,
            displayName: payload.displayName,
            assetType: payload.assetType,
            currency: payload.currency,
            exchange: payload.exchange,
            market: payload.market,
            metadata: payload.metadata
        }
    }

    normalizeQuote(raw: RawQuote): MarketQuote | null {
        const payload = raw.payload as {
            symbol: string
            asOf: string
            price: number
            changePercent: number
        }
        const linkedInstrument = MOCK_INSTRUMENTS.find(instrument => instrument.symbol === payload.symbol)

        return {
            providerId: raw.providerId,
            symbol: payload.symbol,
            assetType: linkedInstrument?.assetType ?? 'OTHER',
            currency: linkedInstrument?.currency ?? 'EUR',
            price: payload.price,
            changePercent: payload.changePercent,
            marketState: 'UNKNOWN',
            asOf: payload.asOf,
            valueSource: 'MARKET',
            displayName: linkedInstrument?.displayName ?? null,
            exchange: linkedInstrument?.exchange ?? null,
            market: linkedInstrument?.market ?? null
        }
    }

    // Generates stable fake prices so UI work can proceed before a real provider is configured.
    private computeDeterministicPrice(symbol: string) {
        const hash = Array.from(symbol).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
        return Number(((hash % 250) + 25 + hash / 1000).toFixed(2))
    }

    // Generates stable fake change percentages alongside deterministic prices.
    private computeDeterministicChange(symbol: string) {
        const hash = Array.from(symbol).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
        return Number((((hash % 15) - 7) / 10).toFixed(2))
    }
}

class BinanceMarketDataProvider implements MarketDataProviderClient {
    getMetadata(): MarketDataProvider {
        return createProviderMetadata('binance', 'Binance', 'WS', ['CRYPTOCURRENCY'], true, true, true)
    }

    supportsAssetType(assetType?: AssetTypeEnum) {
        return !assetType || assetType === 'CRYPTOCURRENCY'
    }

    async searchInstruments(params: SearchMarketInstrumentsParams) {
        if (params.assetType && params.assetType !== 'CRYPTOCURRENCY') {
            return []
        }

        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo')
        if (!response.ok) {
            throw new InternalServerError('Unable to fetch Binance instrument catalog')
        }

        const payload = (await response.json()) as BinanceExchangeInfoResponse
        const normalizedQuery = params.q.trim().toLowerCase()

        return (payload.symbols ?? [])
            .filter(symbolInfo => {
                const searchableContent =
                    `${symbolInfo.symbol} ${symbolInfo.baseAsset} ${symbolInfo.quoteAsset}`.toLowerCase()
                return searchableContent.includes(normalizedQuery)
            })
            .slice(0, params.limit ?? 20)
            .map(symbolInfo => ({
                providerId: this.getMetadata().id,
                payload: symbolInfo
            }))
    }

    async getQuotes(params: GetMarketQuotesParams) {
        if (params.symbols.length === 0) {
            return []
        }

        const webSocketConstructor = this.resolveWebSocketConstructor()
        const streams = params.symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/')
        const endpoint = `wss://stream.binance.com:9443/stream?streams=${streams}`

        return await new Promise<RawQuote[]>((resolve, reject) => {
            const socket = new webSocketConstructor(endpoint)
            const expectedSymbols = new Set(params.symbols.map(symbol => symbol.toUpperCase()))
            const collectedQuotes = new Map<string, RawQuote>()

            const cleanup = () => {
                socket.removeEventListener('message', onMessage)
                socket.removeEventListener('error', onError)
                socket.close()
                clearTimeout(timeoutId)
            }

            const onMessage = (event: { data: string }) => {
                try {
                    const payload = JSON.parse(event.data) as BinanceStreamEnvelope
                    const symbol = payload.data?.s?.toUpperCase()

                    if (!symbol || !expectedSymbols.has(symbol)) {
                        return
                    }

                    collectedQuotes.set(symbol, {
                        providerId: this.getMetadata().id,
                        payload
                    })

                    if (collectedQuotes.size === expectedSymbols.size) {
                        cleanup()
                        resolve(Array.from(collectedQuotes.values()))
                    }
                } catch (error) {
                    cleanup()
                    reject(error)
                }
            }

            const onError = () => {
                cleanup()
                reject(new InternalServerError('Unable to open Binance websocket stream'))
            }

            const timeoutId = setTimeout(() => {
                cleanup()
                if (collectedQuotes.size === 0) {
                    reject(new InternalServerError('Timed out while waiting for Binance quotes'))
                    return
                }

                resolve(Array.from(collectedQuotes.values()))
            }, 3500)

            socket.addEventListener('message', onMessage)
            socket.addEventListener('error', onError)
        })
    }

    normalizeInstrument(raw: RawInstrument): MarketInstrument | null {
        const payload = raw.payload as NonNullable<BinanceExchangeInfoResponse['symbols']>[number]

        return {
            providerId: raw.providerId,
            providerInstrumentId: payload.symbol,
            symbol: payload.symbol,
            displayName: `${payload.baseAsset}/${payload.quoteAsset}`,
            assetType: 'CRYPTOCURRENCY',
            currency: this.mapCurrency(payload.quoteAsset),
            exchange: 'BINANCE',
            market: 'CRYPTO',
            metadata: {
                baseAsset: payload.baseAsset,
                quoteAsset: payload.quoteAsset,
                status: payload.status
            }
        }
    }

    normalizeQuote(raw: RawQuote): MarketQuote | null {
        const payload = raw.payload as BinanceStreamEnvelope
        const ticker = payload.data
        if (!ticker?.s || !ticker.c || !ticker.E) {
            return null
        }

        return {
            providerId: raw.providerId,
            symbol: ticker.s,
            assetType: 'CRYPTOCURRENCY',
            currency: this.mapCurrency(this.extractQuoteCurrency(ticker.s)),
            price: Number(ticker.c),
            changePercent: ticker.P ? Number(ticker.P) : null,
            marketState: 'OPEN',
            asOf: new Date(ticker.E).toISOString(),
            valueSource: 'MARKET',
            displayName: null,
            exchange: 'BINANCE',
            market: 'CRYPTO'
        }
    }

    // Resolves the runtime WebSocket implementation exposed by Node 22.
    private resolveWebSocketConstructor(): MinimalWebSocketConstructor {
        const maybeConstructor = Reflect.get(globalThis, 'WebSocket')
        if (typeof maybeConstructor !== 'function') {
            throw new InternalServerError('Global WebSocket client is not available in this runtime')
        }

        return maybeConstructor as MinimalWebSocketConstructor
    }

    // Maps provider quote currencies to the shared app currency enum.
    private mapCurrency(currency: string): MarketQuote['currency'] {
        const normalizedCurrency = currency.toUpperCase()
        const supportedCurrencies = new Set<MarketQuote['currency']>([
            'USD',
            'EUR',
            'GBP',
            'JPY',
            'CNY',
            'INR',
            'AUD',
            'CAD',
            'CHF',
            'SEK',
            'NZD',
            'MXN',
            'SGD',
            'HKD',
            'NOK',
            'KRW',
            'TRY'
        ])

        return supportedCurrencies.has(normalizedCurrency as MarketQuote['currency'])
            ? (normalizedCurrency as MarketQuote['currency'])
            : 'UNKNOWN'
    }

    // Extracts a quote asset from the Binance trading pair using the most common suffixes.
    private extractQuoteCurrency(symbol: string) {
        const supportedSuffixes = ['USDT', 'EUR', 'USD', 'BTC', 'ETH', 'TRY', 'GBP']
        const uppercasedSymbol = symbol.toUpperCase()
        const matchedSuffix = supportedSuffixes.find(suffix => uppercasedSymbol.endsWith(suffix))
        return matchedSuffix ?? 'UNKNOWN'
    }
}

export class MarketDataService {
    private readonly providers: MarketDataProviderClient[]

    constructor() {
        this.providers = [new MockMarketDataProvider(), new BinanceMarketDataProvider()]
    }

    // Lists the available providers so the frontend can choose one explicitly when needed.
    getProviders() {
        return this.providers.map(provider => provider.getMetadata())
    }

    // Searches raw provider instruments and returns only normalized frontend-safe DTOs.
    async searchInstruments(params: SearchMarketInstrumentsParams) {
        const provider = this.resolveProvider(params.providerId, params.assetType)
        const rawInstruments = await provider.searchInstruments(params)

        return rawInstruments
            .map(rawInstrument => provider.normalizeInstrument(rawInstrument))
            .filter((instrument): instrument is MarketInstrument => instrument !== null)
    }

    // Fetches live quotes from the selected provider and returns normalized market data.
    async getQuotes(params: GetMarketQuotesParams) {
        if (params.symbols.length === 0) {
            throw new BadRequestError('At least one symbol is required')
        }

        const provider = this.resolveProvider(params.providerId, params.assetType)
        const rawQuotes = await provider.getQuotes({
            ...params,
            symbols: params.symbols.map(symbol => symbol.trim()).filter(Boolean)
        })

        return rawQuotes
            .map(rawQuote => provider.normalizeQuote(rawQuote))
            .filter((quote): quote is MarketQuote => quote !== null)
    }

    // Resolves the provider explicitly requested by the client or falls back to the default strategy by asset family.
    private resolveProvider(providerId?: string, assetType?: AssetTypeEnum) {
        if (providerId) {
            const provider = this.providers.find(candidate => candidate.getMetadata().id === providerId)
            if (!provider) {
                throw new BadRequestError(`Unknown market data provider: ${providerId}`)
            }

            if (!provider.supportsAssetType(assetType)) {
                throw new BadRequestError(`Provider ${providerId} does not support asset type ${assetType}`)
            }

            return provider
        }

        if (assetType === 'CRYPTOCURRENCY') {
            return this.providers.find(provider => provider.getMetadata().id === 'binance') ?? this.providers[0]
        }

        return this.providers.find(provider => provider.getMetadata().id === DEFAULT_PROVIDER_ID) ?? this.providers[0]
    }
}
