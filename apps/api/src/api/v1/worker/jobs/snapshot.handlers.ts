import type { JobHandlers } from '@poveroh/types'
import { logger } from '@poveroh/logger'
import { DEFAULT_USER } from '@poveroh/types'
import { SnapshotService } from '../../modules/snapshots/snapshot.service'
import { contextService } from '../../modules/base/context.service'

export const snapshotJobHandlers: JobHandlers = {
    'snapshot.account-balance.add': async payload => {
        // Workers run outside any HTTP request, so we open a user-scoped context
        // derived from the job payload before invoking the service.
        await contextService.runWithContext({ user: { ...DEFAULT_USER, id: payload.userId } }, async () => {
            const snapshotService = new SnapshotService()
            await snapshotService.addAccountBalanceSnapshot({
                accountId: payload.accountId,
                balance: payload.balance,
                snapshotDate: payload.snapshotDate
            })
        })
    },
    'snapshot.generate': async payload => {
        logger.info('Snapshot generation job received', {
            userId: payload.userId,
            snapshotDate: payload.snapshotDate
        })
    }
}
