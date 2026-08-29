'use client'

import { useState } from 'react'

import type { BankSyncLaunchingConnection } from '@poveroh/types'

import { useBankSyncConnections } from './use-bank-sync-connections'
import { toast } from '@poveroh/ui/components/sonner'
import { useTranslations } from 'next-intl'

export type BankSyncLaunchState = BankSyncLaunchingConnection & { providerLabel?: string }

/**
 * Tracks a bank-sync connection whose hosted widget (e.g. Plaid Link) has been opened, and
 * completes it once the widget succeeds.
 * @returns The current launch state and handlers to start, complete, and cancel it.
 */
export function useBankSyncConnectLaunch() {
    const t = useTranslations()

    const { completeConnectionMutation } = useBankSyncConnections()
    const [launching, setLaunching] = useState<BankSyncLaunchState | null>(null)

    const completeLaunch = async (
        callbackPayload: Record<string, string>,
        metadata?: Record<string, any>,
        onCompleted?: (launch: BankSyncLaunchState) => void
    ) => {
        if (!launching) return

        await completeConnectionMutation.mutateAsync({
            path: { connectionId: launching.connectionId },
            body: { callbackPayload, metadata }
        })

        onCompleted?.(launching)
        setLaunching(null)

        toast.success(t('bankSync.toast.connected', { a: launching.providerLabel ?? '' }))
    }

    return {
        launching,
        startLaunch: setLaunching,
        completeLaunch,
        cancelLaunch: () => setLaunching(null)
    }
}
