import type { Request, Response } from 'express'
import type { AssetTypeEnum, MarketDataProvider, MarketInstrument, MarketQuote } from '@poveroh/types'

import { BadRequestError, ResponseHelper } from '@/utils'
import { MarketDataService } from './market-data.service'

export class MarketDataController {
    private readonly marketDataService = new MarketDataService()

    // GET /providers
    async readProviders(req: Request, res: Response) {
        try {
            const providers = await this.marketDataService.getProviders()

            return ResponseHelper.success<MarketDataProvider[]>(res, providers)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /instruments
    async searchInstruments(req: Request, res: Response) {
        try {
            const query = req.query.q as string | undefined
            if (!query) throw new BadRequestError('Missing search query')

            const providerId = req.query.providerId as string | undefined
            const assetType = req.query.assetType as AssetTypeEnum[]
            const limit = Number(req.query.limit)

            const instruments = await this.marketDataService.searchInstruments({
                providerId,
                assetType,
                q: query,
                limit: Number.isNaN(limit) ? undefined : limit
            })

            return ResponseHelper.success<MarketInstrument[]>(res, instruments)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // GET /quotes
    async readQuotes(req: Request, res: Response) {
        try {
            const rawSymbols = req.query.symbols
            const symbolsFromArray =
                Array.isArray(rawSymbols) && rawSymbols.every((symbol): symbol is string => typeof symbol === 'string')
                    ? rawSymbols.flatMap(symbol => symbol.split(',').map(currentSymbol => currentSymbol.trim()))
                    : []
            const symbols =
                typeof rawSymbols === 'string' ? rawSymbols.split(',').map(symbol => symbol.trim()) : symbolsFromArray

            if (symbols.length === 0) throw new BadRequestError('Missing symbols query parameter')

            const providerId = req.query.providerId as string | undefined
            const assetType = req.query.assetType as AssetTypeEnum[]

            const quotes = await this.marketDataService.getQuotes({
                providerId,
                assetType,
                symbols
            })

            return ResponseHelper.success<MarketQuote[]>(res, quotes)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
