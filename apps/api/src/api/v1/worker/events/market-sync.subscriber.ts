import { eventBus } from './event-bus'
import { getJobDispatcher } from '@/utils/queue'

let registered = false

/**
 * Wires the subscribers that keep an asset's net-worth snapshots in sync with its market value.
 * Creating or updating a marketable asset, or adding/editing/removing one of its transactions,
 * dispatches the `market.sync` job so historical snapshots are recomputed in the background.
 * Best-effort by construction: the event bus already isolates and logs handler failures. Idempotent: safe to call once at startup.
 */
export const registerMarketSyncSubscribers = (): void => {
    if (registered) return
    registered = true

    eventBus.on('asset.created', async payload => {
        if (!payload.data.marketable) return
        await getJobDispatcher().dispatch('market.sync', { userId: payload.userId, assetId: payload.data.id })
    })

    eventBus.on('asset.updated', async payload => {
        if (!payload.data.marketable) return
        await getJobDispatcher().dispatch('market.sync', { userId: payload.userId, assetId: payload.data.id })
    })

    eventBus.on('asset-transaction.created', async payload => {
        await getJobDispatcher().dispatch('market.sync', { userId: payload.userId, assetId: payload.data.assetId })
    })

    eventBus.on('asset-transaction.updated', async payload => {
        await getJobDispatcher().dispatch('market.sync', { userId: payload.userId, assetId: payload.data.assetId })
    })

    eventBus.on('asset-transaction.deleted', async payload => {
        await getJobDispatcher().dispatch('market.sync', { userId: payload.userId, assetId: payload.data.assetId })
    })
}
