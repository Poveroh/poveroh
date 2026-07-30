import type { JobHandlers } from '@poveroh/types'
import { DEFAULT_USER } from '@poveroh/types'
import { logger } from '@poveroh/logger/server'
import { contextService } from '../../modules/base/context.service'
import { AssetRepository } from '../../modules/asset/asset/asset.repository'
import { AssetTransactionRepository } from '../../modules/asset/transaction/asset-transaction.repository'
import { MarketDataService } from '../../modules/market-data/data/market-data.service'
import { SnapshotService } from '../../modules/snapshots/snapshot.service'
import { addUtcDays, normalizeDate, toNumber } from '@/utils'

// Only these transaction types change how many units of a marketable asset are held.
const QUANTITY_AFFECTING_TYPES = new Set(['BUY', 'SELL'])

export const assetJobHandlers: JobHandlers = {
    'market.sync': async ({ userId, assetId }) => {
        // Worker jobs run outside any HTTP request, so a minimal context is opened here for
        // the services below (MarketDataService reads the user's preferred provider/credentials).
        await contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, async () => {
            const asset = await new AssetRepository().findById(userId, assetId)

            if (!asset?.marketable) {
                // Only quoted assets (STOCK/BOND/ETF/CRYPTO) have a symbol to value historically.
                logger.info('Skipping market sync for a non-marketable asset', { userId, assetId })
                return
            }

            const transactions = await new AssetTransactionRepository().findAllByAssetId(userId, assetId)
            if (transactions.length === 0) return

            const firstDate = normalizeDate(transactions[0]!.date)
            const today = normalizeDate(new Date())

            const quotes = await new MarketDataService().getHistoricalQuotes({
                symbol: asset.marketable.symbol,
                from: firstDate.toISOString().slice(0, 10),
                to: today.toISOString().slice(0, 10)
            })
            const priceByDate = new Map(quotes.map(quote => [quote.date, quote.close]))

            const dailyHoldings: { date: string; quantity: number; unitPrice: number }[] = []
            let cursor = 0
            let cumulativeQuantity = 0
            // Seed with the opening transaction's own price so days before the provider's first
            // available close still get a sensible valuation instead of being skipped.
            let lastKnownPrice = toNumber(transactions[0]!.unitPrice)

            for (let day = firstDate; day <= today; day = addUtcDays(day, 1)) {
                while (cursor < transactions.length && normalizeDate(transactions[cursor]!.date) <= day) {
                    const transaction = transactions[cursor]!
                    if (QUANTITY_AFFECTING_TYPES.has(transaction.type)) {
                        const change = Math.abs(toNumber(transaction.quantityChange) ?? 0)
                        cumulativeQuantity += transaction.type === 'SELL' ? -change : change
                    }
                    cursor += 1
                }

                const isoDay = day.toISOString().slice(0, 10)
                const price = priceByDate.get(isoDay) ?? lastKnownPrice
                if (price !== null) lastKnownPrice = price

                if (cumulativeQuantity > 0 && price !== null) {
                    dailyHoldings.push({ date: isoDay, quantity: cumulativeQuantity, unitPrice: price })
                }
            }

            await new SnapshotService().backfillAssetSnapshots(userId, assetId, asset.currency, dailyHoldings)

            logger.info('Asset snapshots backfilled', { userId, assetId, days: dailyHoldings.length })
        })
    }
}
