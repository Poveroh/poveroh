'use client'

import type { BankSyncLaunchingConnection } from '@poveroh/types'
import { CONNECT_LAUNCHERS } from './index'

type BankSyncConnectLauncherProps = {
    launching: BankSyncLaunchingConnection | null
    onSuccess: (callbackPayload: Record<string, string>, metadata: Record<string, any>) => void
    onExit: () => void
}

/**
 * Resolves the hosted-widget launcher for the launching connection's provider and mounts it.
 * Renders nothing while no connection is launching or the provider has no launcher registered.
 * @param launching The connection currently awaiting widget completion, or null.
 * @param onSuccess Called with the widget's callback payload and metadata once the user completes it.
 * @param onExit Called when the user closes the widget without completing it.
 */
export function BankSyncConnectLauncher({ launching, onSuccess, onExit }: BankSyncConnectLauncherProps) {
    const Launcher = launching ? CONNECT_LAUNCHERS[launching.providerId] : undefined

    if (!Launcher || !launching) return null

    return <Launcher connectUrl={launching.connectUrl} onSuccess={onSuccess} onExit={onExit} />
}
