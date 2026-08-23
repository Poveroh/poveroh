'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { BankSyncProvider, UpdateBankSyncProviderAppCredentialRequest } from '@poveroh/types'

import { useError } from '@/hooks/use-error'

/**
 * Manages a provider's app-level credential form (one text field per provider.appCredentialFields
 * entry). Submitting saves the credentials and starts the connection in the same request, so
 * "Connect" on a not-yet-configured provider is a single round trip from the user's point of view.
 * @param provider The provider whose app-level credentials are being entered.
 * @returns The form instance, saving state, and a submit handler returning the started connection.
 */
export const useBankAppCredentialForm = (provider: BankSyncProvider) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const schema = useMemo(() => {
        const shape: Record<string, z.ZodString> = {}
        for (const field of provider.appCredentialFields) {
            shape[field.key] = z.string().trim().min(1)
        }
        return z.object(shape)
    }, [])

    const defaultValues = useMemo(
        () => Object.fromEntries(provider.appCredentialFields.map(field => [field.key, ''])),
        []
    )

    const form = useForm<Record<string, string>>({
        resolver: zodResolver(schema),
        defaultValues
    })

    const handleSubmit = async (
        values: UpdateBankSyncProviderAppCredentialRequest,
        dataCallback: (formData: UpdateBankSyncProviderAppCredentialRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            await dataCallback(values, [])
        } catch (error) {
            handleError(error, 'Error saving provider app credentials')
            return null
        }
    }

    return {
        form,
        loading,
        setLoading,
        handleSubmit
    }
}
