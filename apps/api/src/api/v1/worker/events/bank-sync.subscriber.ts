import { eventBus } from './event-bus'
import { getJobDispatcher } from '@/utils/queue'

let registered = false

/**
 * Wires the subscriber that gives a user their first sync immediately after linking a bank
 * connection, instead of waiting for the nightly cron. Best-effort by construction: the event bus
 * already isolates and logs handler failures. Idempotent: safe to call once at startup.
 */
export const registerBankSyncSubscribers = (): void => {
    if (registered) return
    registered = true

    eventBus.on('bank-sync-connection.linked', async payload => {
        await getJobDispatcher().dispatch('bank-sync.sync-connection', {
            userId: payload.userId,
            connectionId: payload.connectionId,
            trigger: 'INITIAL'
        })
    })
}
