'use client'

import { useEffect } from 'react'
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

type PlaidConnectLauncherProps = {
    connectUrl: string
    onSuccess: (callbackPayload: Record<string, string>, metadata: PlaidLinkOnSuccessMetadata) => void
    onExit: () => void
}

export function PlaidConnectLauncher({ connectUrl, onSuccess, onExit }: PlaidConnectLauncherProps) {
    const { open, ready } = usePlaidLink({
        token: connectUrl,
        onSuccess: (publicToken, metadata) => {
            if (publicToken) onSuccess({ publicToken }, metadata)
        },
        onExit
    })

    useEffect(() => {
        if (ready) open()
    }, [ready, open])

    return null
}
