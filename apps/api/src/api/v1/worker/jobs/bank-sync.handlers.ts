import type { JobHandlers } from '@poveroh/types'
import { DEFAULT_USER } from '@poveroh/types'
import { logger } from '@poveroh/logger/server'
import { contextService } from '../../modules/base/context.service'
import { BankConnectionRepository } from '../../modules/bank-sync/connections/bank-connection.repository'
import { BankSyncService } from '../../modules/bank-sync/sync/bank-sync.service'
import { getJobDispatcher } from '@/utils/queue'

export const bankSyncJobHandlers: JobHandlers = {
    'bank-sync.sync-due': async payload => {
        const connections = await new BankConnectionRepository().findAllLinkedAcrossUsers()
        const jobDispatcher = getJobDispatcher()

        for (const connection of connections) {
            await jobDispatcher.dispatch(
                'bank-sync.sync-connection',
                { userId: connection.userId, connectionId: connection.id, trigger: 'CRON' },
                {
                    deduplicationId: `bank-sync:${connection.id}:${payload.date ?? new Date().toISOString().slice(0, 10)}`
                }
            )
        }

        logger.info('Due bank-sync connections dispatched', {
            date: payload.date ?? null,
            connections: connections.length
        })
    },
    'bank-sync.sync-connection': async ({ userId, connectionId, trigger }) => {
        await contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, async () => {
            await new BankSyncService().syncConnection(connectionId, trigger)
        })

        logger.info('Bank connection synced', { userId, connectionId, trigger })
    }
}
