import prisma from '@poveroh/prisma'
import { BankSyncRunStatusEnum, BankSyncTriggerEnum } from '@poveroh/types'

export class BankSyncRunRepository {
    /**
     * Starts a new sync run record for a connection.
     * @param connectionId The connection being synced.
     * @param trigger What caused this run (cron, manual, webhook, or the initial post-link sync).
     * @returns A promise that resolves to the created run's id.
     */
    async start(connectionId: string, trigger: BankSyncTriggerEnum): Promise<string> {
        const run = await prisma.bankSyncRun.create({
            data: { connectionId, trigger, status: 'RUNNING' },
            select: { id: true }
        })
        return run.id
    }

    /**
     * Finalizes a sync run with its outcome and transaction counts.
     * @param runId The run being finalized.
     * @param result The run's final status and counts.
     */
    async finish(
        runId: string,
        result: {
            status: BankSyncRunStatusEnum
            transactionsAdded: number
            transactionsModified: number
            transactionsRemoved: number
            errorMessage?: string
        }
    ): Promise<void> {
        await prisma.bankSyncRun.update({
            where: { id: runId },
            data: { ...result, finishedAt: new Date() }
        })
    }
}
