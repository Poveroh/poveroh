'use client'

import { useQuery } from '@tanstack/react-query'

import { listBankSyncExternalAccountsOptions } from '@/api/@tanstack/react-query.gen'

/**
 * Lists the external accounts a connection reports, before they are mapped to a FinancialAccount.
 * @param connectionId The connection to list external accounts for.
 * @returns The external accounts query and data.
 */
export const useBankSyncExternalAccounts = (connectionId: string) => {
    const externalAccountsQuery = useQuery({
        ...listBankSyncExternalAccountsOptions({ path: { connectionId } }),
        enabled: Boolean(connectionId)
    })

    return {
        externalAccountsQuery,
        externalAccounts: externalAccountsQuery.data?.data ?? []
    }
}
