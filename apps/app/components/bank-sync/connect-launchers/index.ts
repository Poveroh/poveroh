import type { ComponentType } from 'react'
import { PlaidConnectLauncher } from './plaid'

type ConnectLauncherProps = {
    connectUrl: string
    onSuccess: (callbackPayload: Record<string, string>, metadata: Record<string, any>) => void
    onExit: () => void
}

export const CONNECT_LAUNCHERS: Record<string, ComponentType<ConnectLauncherProps>> = {
    plaid: PlaidConnectLauncher
}
