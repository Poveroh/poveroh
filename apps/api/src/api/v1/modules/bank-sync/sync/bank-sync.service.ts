import type { BankSyncTriggerEnum, CurrencyEnum, ExternalTransaction } from '@poveroh/types'
import { createBankSyncClient } from '@poveroh/bank-sync'
import prisma from '@poveroh/prisma'
import { logger } from '@poveroh/logger/server'
import { BadRequestError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { getBankSyncProviderDefinition } from '@/v1/content/template/bank-sync-providers'
import { BankConnectionService } from '../connections/bank-connection.service'
import { BankSyncAppCredentialService } from '../app-credentials/bank-sync-app-credential.service'
import { BankSyncAccountRepository, type BankSyncAccountRecord } from '../accounts/bank-sync-account.repository'
import { BankSyncRunRepository } from './bank-sync-run.repository'

/**
 * The bank-sync engine: fetches incremental transactions for every account on a connection and
 * upserts them idempotently, keyed by `(bankSyncAccountId, externalTransactionId)`. Shared by the
 * nightly cron, the manual "sync now" action, and provider webhooks — they all dispatch the same
 * `bank-sync.sync-connection` job, which calls this one method.
 */
export class BankSyncService extends BaseService {
    private readonly connectionService = new BankConnectionService()
    private readonly appCredentialService = new BankSyncAppCredentialService()
    private readonly accountRepository = new BankSyncAccountRepository()
    private readonly runRepository = new BankSyncRunRepository()

    constructor() {
        super('bank-sync')
    }

    /**
     * Syncs every account on a connection, persisting progress after each account so a failure on
     * one account never rolls back another account's already-committed progress within the same run.
     * @param connectionId The connection to sync.
     * @param trigger What caused this run.
     */
    async syncConnection(connectionId: string, trigger: BankSyncTriggerEnum): Promise<void> {
        const userId = this.context.currentUser.id
        const { connection, secret } = await this.connectionService.getConnectionWithDecryptedSecret(connectionId)

        if (connection.status !== 'LINKED' || !connection.externalConnectionId) {
            logger.info('Skipping sync for a connection that is not linked', {
                connectionId,
                status: connection.status
            })
            return
        }

        const runId = await this.runRepository.start(connectionId, trigger)
        const client = createBankSyncClient(
            connection.providerId,
            await this.resolveAppCredentials(connection.providerId)
        )
        const accounts = await this.accountRepository.listByConnection(connectionId)

        let added = 0
        let modified = 0
        let removed = 0
        let lastError: string | undefined

        for (const account of accounts) {
            try {
                const result = await client.syncTransactions({
                    secret,
                    externalConnectionId: connection.externalConnectionId,
                    externalAccountId: account.externalAccountId,
                    cursor: account.syncCursor
                })

                for (const transaction of result.added) {
                    await this.upsertTransaction(userId, connection.id, account, transaction)
                }
                for (const transaction of result.modified) {
                    await this.upsertTransaction(userId, connection.id, account, transaction)
                }
                if (result.removedExternalIds.length > 0) {
                    await this.removeTransactions(account.id, result.removedExternalIds)
                }

                // Persisted immediately so a later account's failure doesn't lose this account's progress.
                await this.accountRepository.updateCursor(account.id, result.nextCursor)

                added += result.added.length
                modified += result.modified.length
                removed += result.removedExternalIds.length
            } catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown sync error'
                logger.error('Bank-sync account sync failed', { connectionId, accountId: account.id, error })
            }
        }

        await this.runRepository.finish(runId, {
            status: lastError ? (added + modified > 0 ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
            transactionsAdded: added,
            transactionsModified: modified,
            transactionsRemoved: removed,
            errorMessage: lastError
        })

        await prisma.bankConnection.update({
            where: { id: connectionId },
            data: {
                lastSyncedAt: new Date(),
                lastSyncError: lastError ?? null,
                status: lastError && added + modified === 0 ? 'ERROR' : 'LINKED'
            }
        })

        await eventBus.emit('bank-sync.synced', { userId, connectionId, transactionsAdded: added })
    }

    /**
     * Resolves the app-level credentials to pass into `createBankSyncClient`, decrypted from the
     * user's saved provider credential. Throws when the provider requires app credentials and
     * none have been configured — this should not normally happen for an already-`LINKED`
     * connection, but the provider's app credentials could have been deleted since.
     * @param providerId The provider whose app-level credentials are being resolved.
     * @returns A promise that resolves to the decrypted app-level credential map (empty when none are required).
     */
    private async resolveAppCredentials(providerId: string) {
        const definition = getBankSyncProviderDefinition(providerId)
        if (!definition || definition.appCredentialFields.length === 0) return {}

        const credentials = await this.appCredentialService.getDecryptedAppCredential(providerId)
        if (!credentials) {
            throw new BadRequestError(`Provider "${providerId}" requires app-level credentials. Configure them first.`)
        }

        return credentials
    }

    /**
     * Upserts a single external transaction, keyed by `(bankSyncAccountId, externalTransactionId)`:
     * updates the transaction and amount if already synced, otherwise creates both.
     * @param userId The owner of the transaction being created or updated.
     * @param connectionId The bank connection the transaction belongs to.
     * @param account The bank-sync account the transaction was fetched for.
     * @param transaction The provider's transaction to upsert.
     * @returns A promise that resolves once the transaction is persisted.
     */
    private async upsertTransaction(
        userId: string,
        connectionId: string,
        account: BankSyncAccountRecord,
        transaction: ExternalTransaction
    ): Promise<void> {
        const existingAmount = await prisma.amount.findUnique({
            where: {
                bankSyncAccountId_externalTransactionId: {
                    bankSyncAccountId: account.id,
                    externalTransactionId: transaction.externalId
                }
            },
            select: { id: true, transactionId: true }
        })

        const action = transaction.amount < 0 ? 'EXPENSES' : 'INCOME'
        const amount = Math.abs(transaction.amount)

        if (existingAmount) {
            await prisma.transaction.update({
                where: { id: existingAmount.transactionId },
                data: { date: new Date(transaction.date), title: transaction.description }
            })
            await prisma.amount.update({
                where: { id: existingAmount.id },
                data: { amount, currency: transaction.currency, action }
            })
            return
        }

        await prisma.transaction.create({
            data: {
                userId,
                date: new Date(transaction.date),
                title: transaction.description,
                action,
                status: 'BANK_SYNC_PENDING',
                bankConnectionId: connectionId,
                amounts: {
                    create: {
                        amount,
                        currency: transaction.currency,
                        action,
                        financialAccountId: account.financialAccountId,
                        bankSyncAccountId: account.id,
                        externalTransactionId: transaction.externalId
                    }
                }
            }
        })
    }

    /**
     * Soft-deletes the transactions and amounts for external transactions the provider reported
     * as removed.
     * @param bankSyncAccountId The bank-sync account the removed transactions belong to.
     * @param externalIds The provider's external transaction ids to remove.
     * @returns A promise that resolves once the matching rows are soft-deleted.
     */
    private async removeTransactions(bankSyncAccountId: string, externalIds: string[]): Promise<void> {
        const amounts = await prisma.amount.findMany({
            where: { bankSyncAccountId, externalTransactionId: { in: externalIds } },
            select: { transactionId: true }
        })
        if (amounts.length === 0) return

        const now = new Date()
        const transactionIds = amounts.map(amount => amount.transactionId)

        await prisma.transaction.updateMany({ where: { id: { in: transactionIds } }, data: { deletedAt: now } })
        await prisma.amount.updateMany({ where: { transactionId: { in: transactionIds } }, data: { deletedAt: now } })
    }
}
