'use client'

import { useTranslations } from 'next-intl'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import type { BankSyncConnectionData, BankSyncProvider } from '@poveroh/types'

import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'
import { useBankSyncConnectLaunch } from '@/hooks/use-bank-sync-connect-launch'
import { CONNECT_LAUNCHERS } from './connect-launchers'
import { BankSyncConnectLauncher } from './connect-launchers/bank-sync-connect-launcher'
import { BankConnectionListItem } from './bank-connection-list-item'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'

type BankConnectionCardProps = {
    provider: BankSyncProvider
    connections: BankSyncConnectionData[]
}

export function BankConnectionCard({ provider, connections }: BankConnectionCardProps) {
    const t = useTranslations()
    const { createConnectionMutation } = useBankSyncConnections()
    const { launching, startLaunch, completeLaunch, cancelLaunch } = useBankSyncConnectLaunch()

    const modalManager = useModal<BankSyncProvider>(MODAL_IDS.BANK_APP_CREDENTIALS)
    const modalManagerMapping = useModal<BankSyncConnectionData>(MODAL_IDS.BANK_APP_ACCOUNT_MAPPING)

    const handleAddConnection = async () => {
        const result = await createConnectionMutation.mutateAsync({ body: { providerId: provider.id } })
        if (!result?.data?.connectUrl) return

        if (CONNECT_LAUNCHERS[provider.id]) {
            startLaunch({
                connectionId: result.data.connection.id,
                connectUrl: result.data.connectUrl,
                providerLabel: provider.label,
                providerId: provider.id
            })
        } else {
            window.location.href = result.data.connectUrl
        }
    }

    return (
        <div className='flex flex-col gap-4 py-6 first:pt-0 last:pb-0'>
            <p className='sub whitespace-pre-line'>{t(`bankSync.list.${provider.id}.setup`)}</p>

            {provider.configured && (
                <div className='flex flex-col'>
                    <div className='flex flex-row items-center justify-between'>
                        <p className='font-bold'>{t('bankSync.connections.title')}</p>
                        <Button
                            type='button'
                            variant='secondary'
                            size='icon'
                            onClick={() => void handleAddConnection()}
                            disabled={createConnectionMutation.isPending}
                        >
                            {createConnectionMutation.isPending ? <Loader2 className='animate-spin' /> : <Plus />}
                        </Button>
                    </div>
                    {connections.length > 0 && (
                        <div className='flex flex-col divide-y divide-hr'>
                            {connections.map(connection => (
                                <BankConnectionListItem
                                    key={connection.id}
                                    connection={connection}
                                    onManageAccounts={x => modalManagerMapping.openModal('view', x)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!provider.configured && (
                <div className='flex flex-row justify-end'>
                    <Button type='button' onClick={() => modalManager.openModal('create', provider)}>
                        {t('buttons.connect')}
                    </Button>
                </div>
            )}

            <BankSyncConnectLauncher launching={launching} onSuccess={completeLaunch} onExit={cancelLaunch} />
        </div>
    )
}
