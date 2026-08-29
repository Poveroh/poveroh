import type { BankSyncAccount, BankSyncAccountMapping, ExternalBankAccount } from '@poveroh/types'
import { createBankSyncClient } from '@poveroh/bank-sync'
import { BadRequestError, ConflictError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { BankConnectionService } from '../connections/bank-connection.service'
import { BankSyncAppCredentialService } from '../app-credentials/bank-sync-app-credential.service'
import { getBankSyncProviderDefinition } from '@/v1/content/template/bank-sync-providers'
import { FinancialAccountService } from '@/v1/modules/financial-accounts/financial-account.service'
import { BankSyncAccountRepository } from './bank-sync-account.repository'

/**
 * Service that lists a connection's external accounts and persists the mapping between them and
 * the user's `FinancialAccount` rows, enforcing that a FinancialAccount is fed by at most one
 * live mapping.
 */
export class BankSyncAccountService extends BaseService {
    private readonly connectionService = new BankConnectionService()
    private readonly appCredentialService = new BankSyncAppCredentialService()
    private readonly financialAccountService = new FinancialAccountService()
    private readonly accountRepository = new BankSyncAccountRepository()

    constructor() {
        super('bank-sync')
    }

    /**
     * Lists the bank accounts the provider reports for a connection, before any mapping exists.
     * @param connectionId The connection to list external accounts for.
     * @returns A promise that resolves to the normalized list of external accounts.
     */
    async listExternalAccounts(connectionId: string): Promise<ExternalBankAccount[]> {
        const { connection, secret } = await this.connectionService.getConnectionWithDecryptedSecret(connectionId)
        if (!connection.externalConnectionId) throw new BadRequestError('Connection is not linked yet')

        const definition = getBankSyncProviderDefinition(connection.providerId)
        const appCredentials =
            definition && definition.appCredentialFields.length > 0
                ? await this.appCredentialService.getDecryptedAppCredential(connection.providerId)
                : {}
        if (!appCredentials) {
            throw new BadRequestError(
                `Provider "${connection.providerId}" requires app-level credentials. Configure them first.`
            )
        }

        const client = createBankSyncClient(connection.providerId, appCredentials)
        const externalAccounts = await client.listAccounts({
            secret,
            externalConnectionId: connection.externalConnectionId
        })

        const existingMappings = await this.accountRepository.listByConnection(connectionId)
        const financialAccountIdByExternalId = new Map(
            existingMappings.map(mapping => [mapping.externalAccountId, mapping.financialAccountId])
        )

        return externalAccounts.map(account => ({
            ...account,
            financialAccountId: financialAccountIdByExternalId.get(account.externalAccountId)
        }))
    }

    /**
     * Persists the mapping between a connection's external accounts and FinancialAccount rows.
     * A FinancialAccount can only be fed by one live mapping, so any mapping that already holds a
     * requested account is released first when it is safe to do so - it belongs to this same
     * connection (a repoint or a swap between two of its accounts) or to a connection the user has
     * revoked. A mapping held by another live connection is a real conflict and is reported as one
     * instead of being silently stolen.
     * Mapping an external account is optional, so a row with an empty financialAccountId means
     * "leave this one unmapped": it is dropped up front and its existing mapping, if any, is left
     * untouched rather than released.
     * @param connectionId The connection whose accounts are being mapped.
     * @param mappings The external-account-to-FinancialAccount mappings to persist, unmapped rows included.
     * @returns A promise that resolves to the persisted account mappings.
     */
    async linkAccounts(connectionId: string, mappings: BankSyncAccountMapping[]): Promise<BankSyncAccount[]> {
        const { connection } = await this.connectionService.getConnectionWithDecryptedSecret(connectionId)

        const requested = mappings.filter(mapping => mapping.financialAccountId !== '')

        this.assertNoDuplicates(requested)

        for (const mapping of requested) {
            await this.financialAccountService.doesAccountExist(mapping.financialAccountId, true)
        }

        const releaseIds = await this.resolveReleasableMappings(connection.id, requested)

        const persisted = await this.accountRepository.applyMappings(connection.id, requested, releaseIds)

        return persisted.map(record => ({
            id: record.id,
            externalAccountId: record.externalAccountId,
            externalAccountName: record.externalAccountName,
            financialAccountId: record.financialAccountId,
            lastSyncedAt: record.lastSyncedAt?.toISOString() ?? null
        }))
    }

    /**
     * Rejects a submission that points two external accounts at the same FinancialAccount, which
     * the live uniqueness would otherwise reject with an opaque database error.
     * @param mappings The mappings submitted for the connection.
     */
    private assertNoDuplicates(mappings: BankSyncAccountMapping[]): void {
        const financialAccountIds = mappings.map(mapping => mapping.financialAccountId)
        if (new Set(financialAccountIds).size !== financialAccountIds.length) {
            throw new BadRequestError('Each financial account can only be mapped to one bank account')
        }
    }

    /**
     * Decides which existing mappings must be released before the submitted ones can be written,
     * and refuses the whole submission when a requested FinancialAccount is still claimed by
     * another live connection.
     * @param connectionId The connection whose accounts are being mapped.
     * @param mappings The mappings submitted for the connection.
     * @returns A promise that resolves to the IDs of the mappings to release.
     */
    private async resolveReleasableMappings(
        connectionId: string,
        mappings: BankSyncAccountMapping[]
    ): Promise<string[]> {
        const holders = await this.accountRepository.findLiveByFinancialAccountIds(
            mappings.map(mapping => mapping.financialAccountId)
        )

        const requestedByExternalAccountId = new Map(
            mappings.map(mapping => [mapping.externalAccountId, mapping.financialAccountId])
        )

        const releaseIds: string[] = []

        for (const holder of holders) {
            // The row the upsert itself will repoint, so it must not be released out from under it.
            if (
                holder.connectionId === connectionId &&
                requestedByExternalAccountId.get(holder.externalAccountId) === holder.financialAccountId
            ) {
                continue
            }

            if (holder.connectionId !== connectionId && !holder.connectionRevoked) {
                throw new ConflictError('One of the selected financial accounts is already linked to another bank')
            }

            releaseIds.push(holder.id)
        }

        return releaseIds
    }
}
