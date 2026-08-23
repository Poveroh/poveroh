'use client'

import { useTranslations } from 'next-intl'
import { Loader2, RefreshCw, Settings, Unlink } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { toast } from '@poveroh/ui/components/sonner'
import type { BankSyncConnectionData } from '@poveroh/types'

import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'
import { BankConnectionStatusBadge } from './bank-connection-status-badge'

type BankConnectionListItemProps = {
    connection: BankSyncConnectionData
    onManageAccounts: (connection: BankSyncConnectionData) => void
}

export function BankConnectionListItem({ connection, onManageAccounts }: BankConnectionListItemProps) {
    const t = useTranslations()
    const { triggerSyncMutation, deleteConnectionMutation } = useBankSyncConnections()

    const handleSync = async () => {
        const result = await triggerSyncMutation.mutateAsync({ path: { connectionId: connection.id } })
        if (result?.success) {
            toast.success(t('bankSync.toast.syncStarted'))
        }
    }

    const handleDisconnect = async () => {
        const result = await deleteConnectionMutation.mutateAsync({ path: { connectionId: connection.id } })
        if (result?.success) {
            toast.success(t('bankSync.toast.disconnected', { a: connection.institutionName ?? connection.providerId }))
        }
    }

    const busy = triggerSyncMutation.isPending || deleteConnectionMutation.isPending

    return (
        <div className='flex flex-row items-center justify-between gap-3 py-3'>
            <div className='flex flex-col'>
                <p>{connection.institutionName ?? connection.providerId}</p>
                <BankConnectionStatusBadge status={connection.status} />
            </div>

            <div className='flex flex-row items-center gap-2'>
                {connection.status === 'LINKED' && (
                    <>
                        <Button
                            type='button'
                            variant='secondary'
                            size='icon'
                            onClick={() => onManageAccounts(connection)}
                        >
                            <Settings />
                        </Button>
                        <Button
                            type='button'
                            variant='secondary'
                            size='icon'
                            onClick={() => void handleSync()}
                            disabled={busy}
                        >
                            {triggerSyncMutation.isPending ? <Loader2 className='animate-spin' /> : <RefreshCw />}
                        </Button>
                    </>
                )}
                <Button
                    type='button'
                    variant='danger'
                    size='icon'
                    onClick={() => void handleDisconnect()}
                    disabled={busy}
                >
                    {deleteConnectionMutation.isPending ? <Loader2 className='animate-spin' /> : <Unlink />}
                </Button>
            </div>
        </div>
    )
}
