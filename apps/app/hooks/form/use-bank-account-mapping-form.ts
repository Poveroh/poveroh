'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { LinkBankSyncAccountForm, LinkBankSyncAccountsRequest } from '@poveroh/types'
import { LinkBankSyncAccountFormSchema } from '@poveroh/schemas'
import { logger } from '@poveroh/logger/browser'

import { useError } from '@/hooks/use-error'
import { useBankSyncExternalAccounts } from '@/hooks/use-bank-sync-external-accounts'

/**
 * Manages the form that maps a connection's reported external accounts to existing
 * FinancialAccounts, seeding one row per external account and keeping the field array in sync
 * as the external accounts query resolves.
 * @param connectionId The bank connection whose external accounts are being mapped.
 * @returns The form instance, the seeded rows, the source external accounts, loading state, and a submit handler.
 */
export const useBankAccountMappingForm = (connectionId: string) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const { externalAccountsQuery, externalAccounts } = useBankSyncExternalAccounts(connectionId)

    const form = useForm<LinkBankSyncAccountForm>({
        resolver: zodResolver(LinkBankSyncAccountFormSchema),
        defaultValues: { mappings: [] }
    })

    const { fields, replace } = useFieldArray({ control: form.control, name: 'mappings' })

    const externalAccountIds = externalAccounts.map(account => account.externalAccountId).join(',')

    useEffect(() => {
        replace(
            externalAccounts.map(account => ({
                externalAccountId: account.externalAccountId,
                financialAccountId: account.financialAccountId ?? ''
            }))
        )
    }, [externalAccountIds])

    useEffect(() => {
        if (Object.keys(form.formState.errors).length > 0) {
            logger.debug('Form errors:', form.formState.errors)
        }
    }, [form.formState.errors])

    const handleSubmit = async (
        values: LinkBankSyncAccountsRequest,
        dataCallback: (payload: LinkBankSyncAccountsRequest) => Promise<void>
    ) => {
        try {
            setLoading(true)

            await dataCallback(values)
        } catch (error) {
            handleError(error, 'Error mapping bank accounts')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        fields,
        externalAccounts,
        isLoadingExternalAccounts: externalAccountsQuery.isPending,
        loading,
        handleSubmit
    }
}
