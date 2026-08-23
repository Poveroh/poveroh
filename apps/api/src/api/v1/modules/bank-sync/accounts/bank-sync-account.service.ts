import type { BankSyncAccount, BankSyncAccountMapping, ExternalBankAccount } from '@poveroh/types'
import { createBankSyncClient } from '@poveroh/bank-sync'
import { BadRequestError } from '@/utils'
import { BaseService } from '@/v1/modules/base/base.service'
import { BankConnectionService } from '../connections/bank-connection.service'
import { BankSyncAppCredentialService } from '../app-credentials/bank-sync-app-credential.service'
import { getBankSyncProviderDefinition } from '@/v1/content/template/bank-sync-providers'
import { FinancialAccountService } from '@/v1/modules/financial-accounts/financial-account.service'
import { BankSyncAccountRepository, type BankSyncAccountRecord } from './bank-sync-account.repository'

/**
 * Service that lists a connection's external accounts and persists the mapping between them and
 * the user's `FinancialAccount` rows, either reusing an existing account or creating a new one.
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
     * Persists the mapping between a connection's external accounts and FinancialAccount rows,
     * creating a new FinancialAccount for any mapping that requests one.
     * @param connectionId The connection whose accounts are being mapped.
     * @param mappings The external-account-to-FinancialAccount mappings to persist.
     * @returns A promise that resolves to the created account mappings.
     */
    async linkAccounts(connectionId: string, mappings: BankSyncAccountMapping[]): Promise<BankSyncAccount[]> {
        const { connection } = await this.connectionService.getConnectionWithDecryptedSecret(connectionId)

        const created: BankSyncAccountRecord[] = []

        for (const mapping of mappings) {
            await this.financialAccountService.doesAccountExist(mapping.financialAccountId)

            const record = await this.accountRepository.upsertByExternalAccount({
                connectionId: connection.id,
                externalAccountName: '',
                currency: 'EUR',
                ...mapping
            })

            created.push(record)
        }

        return created as unknown as BankSyncAccount[]
    }
}
