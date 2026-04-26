import type { Request, Response } from 'express'
import type { AssetTypeEnum } from '@poveroh/types'
import { BadRequestError, ResponseHelper } from '@/src/utils'
import { MarketDataService } from '../services/market-data.service'

export class MarketDataController {
    // Lists available market data providers.
    static async readProviders(req: Request, res: Response) {
        try {
            const marketDataService = new MarketDataService()
            const providers = marketDataService.getProviders()

            return ResponseHelper.success(res, providers)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Searches provider instruments and returns normalized market instruments.
    static async searchInstruments(req: Request, res: Response) {
        try {
            const query = typeof req.query.q === 'string' ? req.query.q : ''
            if (!query) {
                throw new BadRequestError('Missing search query')
            }

            const providerId = typeof req.query.providerId === 'string' ? req.query.providerId : undefined
            const assetType =
                typeof req.query.assetType === 'string' ? (req.query.assetType as AssetTypeEnum) : undefined
            const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined

            const marketDataService = new MarketDataService()
            const instruments = await marketDataService.searchInstruments({
                providerId,
                assetType,
                q: query,
                limit: Number.isNaN(limit) ? undefined : limit
            })

            return ResponseHelper.success(res, instruments)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Fetches normalized quotes for one or more symbols.
    static async readQuotes(req: Request, res: Response) {
        try {
            const rawSymbols = req.query.symbols
            const symbolsFromArray =
                Array.isArray(rawSymbols) && rawSymbols.every((symbol): symbol is string => typeof symbol === 'string')
                    ? rawSymbols.flatMap(symbol => symbol.split(',').map(currentSymbol => currentSymbol.trim()))
                    : []
            const symbols =
                typeof rawSymbols === 'string' ? rawSymbols.split(',').map(symbol => symbol.trim()) : symbolsFromArray

            if (symbols.length === 0) {
                throw new BadRequestError('Missing symbols query parameter')
            }

            const providerId = typeof req.query.providerId === 'string' ? req.query.providerId : undefined
            const assetType =
                typeof req.query.assetType === 'string' ? (req.query.assetType as AssetTypeEnum) : undefined

            const marketDataService = new MarketDataService()
            const quotes = await marketDataService.getQuotes({
                providerId,
                assetType,
                symbols
            })

            return ResponseHelper.success(res, quotes)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }
}
