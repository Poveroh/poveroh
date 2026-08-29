import type { BankSyncTriggerEnum, ExternalTransaction, TransactionActionEnum } from '@poveroh/types'
import { createBankSyncClient } from '@poveroh/bank-sync'
import { logger } from '@poveroh/logger/server'
import { BadRequestError } from '@/utils'
import { AccountBalanceService } from '@/v1/modules/financial-accounts/account-balance/account-balance.service'
import { BaseService } from '@/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { getBankSyncProviderDefinition } from '@/v1/content/template/bank-sync-providers'
import { ImportIngestionService } from '@/v1/modules/imports/ingestion/import-ingestion.service'
import { BankConnectionService } from '../connections/bank-connection.service'
import { BankSyncAppCredentialService } from '../app-credentials/bank-sync-app-credential.service'
import { BankSyncAccountRepository, type BankSyncAccountRecord } from '../accounts/bank-sync-account.repository'
import { BankConnectionRepository } from '../connections/bank-connection.repository'
import { BankSyncRunRepository } from './bank-sync-run.repository'
import { BankSyncTransactionRepository } from './bank-sync-transaction.repository'

/**
 * The bank-sync engine: fetches incremental transactions for every account on a connection,
 * identified idempotently by `(bankSyncAccountId, externalTransactionId)`. Updates to transactions
 * we already hold are applied in place; the ones new to us are handed to the import flow, which
 * enriches them and files them for review like any other source. Shared by the nightly cron, the
 * manual "sync now" action, and provider webhooks — they all dispatch the same
 * `bank-sync.sync-connection` job, which calls this one method.
 */
export class BankSyncService extends BaseService {
    private readonly connectionService = new BankConnectionService()
    private readonly appCredentialService = new BankSyncAppCredentialService()
    private readonly accountRepository = new BankSyncAccountRepository()
    private readonly connectionRepository = new BankConnectionRepository()
    private readonly runRepository = new BankSyncRunRepository()
    private readonly transactionRepository = new BankSyncTransactionRepository()
    private readonly ingestionService = new ImportIngestionService()
    private readonly accountBalanceService = new AccountBalanceService()

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

                // `added` and `modified` are split by whether we already hold the transaction, not by
                // which list the provider put it in: an update to a transaction the user may have
                // already approved must be applied in place, while anything we have never seen —
                // including a `modified` row an earlier run missed — is new and has to go through
                // import review.
                const newTransactions = await this.applyProviderUpdates(account, [...result.added, ...result.modified])

                if (newTransactions.length > 0) {
                    await this.ingestNewTransactions(connection, account, newTransactions)
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

        await this.connectionRepository.update(connectionId, {
            lastSyncedAt: new Date(),
            lastSyncError: lastError ?? null,
            status: lastError && added + modified === 0 ? 'ERROR' : 'LINKED'
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
     * Applies the provider's updates to the transactions we already hold and reports back the ones
     * that are new to us.
     *
     * Everything is resolved from a single lookup keyed by `(bankSyncAccountId,
     * externalTransactionId)`: a provider re-sends the same rows on every run, so checking them one
     * by one meant a query per transaction, and rows that had not actually changed were rewritten
     * anyway. Balances are rebuilt once, from the earliest date any approved transaction moved to,
     * instead of once per changed row — rebuilding the daily series and the snapshots is by far the
     * most expensive thing this method can trigger.
     * @param account The bank-sync account the transactions were fetched for.
     * @param transactions Everything the provider returned as added or modified.
     * @returns A promise that resolves to the transactions we have never seen before.
     */
    private async applyProviderUpdates(
        account: BankSyncAccountRecord,
        transactions: ExternalTransaction[]
    ): Promise<ExternalTransaction[]> {
        if (transactions.length === 0) return []

        const existing = await this.transactionRepository.findSyncedByExternalIds(
            account.id,
            transactions.map(transaction => transaction.externalId)
        )

        const byExternalId = new Map(existing.map(row => [row.externalTransactionId, row]))

        const unseen: ExternalTransaction[] = []
        let earliestAffected: Date | null = null

        for (const transaction of transactions) {
            const current = byExternalId.get(transaction.externalId)

            if (!current) {
                unseen.push(transaction)
                continue
            }

            const date = new Date(transaction.date)
            const amount = Math.abs(transaction.amount)
            const action: TransactionActionEnum = transaction.amount < 0 ? 'EXPENSES' : 'INCOME'

            const unchanged =
                current.transaction.title === transaction.description &&
                current.transaction.date.getTime() === date.getTime() &&
                current.amount.toFixed(2) === amount.toFixed(2) &&
                current.currency === transaction.currency &&
                current.action === action

            if (unchanged) continue

            await this.transactionRepository.applyProviderUpdate(current.transactionId, current.id, {
                date,
                title: transaction.description,
                amount,
                currency: transaction.currency,
                action
            })

            // Already-approved transactions count toward the balance, so a change to their amount or
            // date requires rebuilding the daily series from whichever date moved first.
            if (current.transaction.status === 'APPROVED') {
                const from = new Date(Math.min(current.transaction.date.getTime(), date.getTime()))
                if (!earliestAffected || from < earliestAffected) earliestAffected = from
            }
        }

        if (earliestAffected) {
            await this.accountBalanceService.recomputeAccountsAndSnapshots(
                [account.financialAccountId],
                earliestAffected
            )
        }

        return unseen
    }

    /**
     * Hands transactions we have never seen to the import flow, which enriches them and files them
     * for review exactly like a CSV upload. Bank-sync's job ends at delivering normalized rows.
     * @param connection The connection the transactions were synced from.
     * @param account The bank-sync account they belong to.
     * @param transactions The transactions that are new to us.
     * @returns A promise that resolves once the transactions have been handed over.
     */
    private async ingestNewTransactions(
        connection: { id: string; providerId: string; autoApproveTransactions: boolean },
        account: BankSyncAccountRecord,
        transactions: ExternalTransaction[]
    ): Promise<void> {
        await this.ingestionService.ingest({
            source: 'BANK_SYNC',
            financialAccountId: account.financialAccountId,
            sourceReference: connection.providerId,
            bankConnectionId: connection.id,
            autoApprove: connection.autoApproveTransactions,
            transactions: transactions.map(transaction => ({
                date: transaction.date,
                title: transaction.description,
                amount: Math.abs(transaction.amount),
                currency: transaction.currency,
                action: transaction.amount < 0 ? 'EXPENSES' : 'INCOME',
                externalTransactionId: transaction.externalId,
                bankSyncAccountId: account.id
            }))
        })
    }

    /**
     * Soft-deletes the transactions and amounts for external transactions the provider reported
     * as removed, rebuilding the balance of any account whose already-approved transaction was
     * removed, since those no longer count toward the balance once deleted.
     * @param bankSyncAccountId The bank-sync account the removed transactions belong to.
     * @param externalIds The provider's external transaction ids to remove.
     * @returns A promise that resolves once the matching rows are soft-deleted.
     */
    private async removeTransactions(bankSyncAccountId: string, externalIds: string[]): Promise<void> {
        const amounts = await this.transactionRepository.findRemovalTargets(bankSyncAccountId, externalIds)
        if (amounts.length === 0) return

        await this.transactionRepository.softDeleteByTransactionIds(amounts.map(amount => amount.transactionId))

        const approved = amounts.filter(amount => amount.transaction.status === 'APPROVED')
        if (approved.length === 0) return

        const fromDate = new Date(Math.min(...approved.map(amount => amount.transaction.date.getTime())))
        const financialAccountIds = [...new Set(approved.map(amount => amount.financialAccountId))]
        await this.accountBalanceService.recomputeAccountsAndSnapshots(financialAccountIds, fromDate)
    }
}
