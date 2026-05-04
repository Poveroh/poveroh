import type { Request, Response } from 'express'
import type { AssetTypeEnum } from '@poveroh/types'

import { BadRequestError, ResponseHelper } from '@/src/utils'
import { getParamString } from '@/src/utils/request'
import { MarketDataService } from '../services/market-data.service'
import { MarketDataCredentialService } from '../services/market-data-credential.service'

export class MarketDataController {
    // Lists available market data providers, including a per-user `configured` flag.
    static async readProviders(req: Request, res: Response) {
        try {
            const marketDataService = new MarketDataService(req.user.id)
            const providers = await marketDataService.getProviders()

            return ResponseHelper.success(res, providers)
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Encrypts and stores the user's API key for the requested provider.
    static async saveProviderCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : ''

            if (!apiKey) throw new BadRequestError('apiKey is required')

            const credentialService = new MarketDataCredentialService(req.user.id)
            await credentialService.saveCredential(providerId, { apiKey })

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Deletes the encrypted credential row. Does not require the password.
    static async deleteProviderCredential(req: Request, res: Response) {
        try {
            const providerId = getParamString(req.params, 'providerId')
            if (!providerId) throw new BadRequestError('Missing provider ID in path')

            const credentialService = new MarketDataCredentialService(req.user.id)
            await credentialService.deleteCredential(providerId)

            return ResponseHelper.success(res, { success: true })
        } catch (error) {
            return ResponseHelper.handleError(res, error)
        }
    }

    // Searches provider instruments. Currently a stub until provider clients are implemented.
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

            const marketDataService = new MarketDataService(req.user.id)
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

    // Fetches normalized quotes. Currently a stub until provider clients are implemented.
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

            const marketDataService = new MarketDataService(req.user.id)
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
