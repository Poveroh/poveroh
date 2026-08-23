'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'

import { Input } from '@poveroh/ui/components/input'

import Box from '@/components/box/box-wrapper'
import { PageWrapper } from '@/components/box/page-wrapper'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import { BankConnectionCard } from '@/components/bank-sync/bank-connection-card'
import { BankAccountMappingDialog } from '@/components/dialog/bank-app/bank-account-mapping-dialog'

import { useBankSyncProvider } from '@/hooks/use-bank-sync-provider'
import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'
import { ProviderStatusBadge } from '@/components/provider/provider-credential-card-badge'
import { BankAppCredentialDialog } from '@/components/dialog/bank-app/bank-app-credential-dialog'

export default function BankSyncView() {
    const t = useTranslations()
    const { providersQuery, filteredProviders, searchText, onSearch } = useBankSyncProvider()
    const { connections } = useBankSyncConnections()

    const connectionsByProvider = useMemo(() => {
        const map = new Map<string, typeof connections>()
        for (const connection of connections) {
            map.set(connection.providerId, [...(map.get(connection.providerId) ?? []), connection])
        }
        return map
    }, [connections])

    if (providersQuery.isPending) {
        return (
            <PageWrapper>
                <Header
                    title={t('bankSync.title')}
                    titleSize='compact'
                    breadcrumbs={[
                        { label: t('settings.title') },
                        { label: t('bankSync.breadcrumb.advanced') },
                        { label: t('bankSync.title') }
                    ]}
                />
                <SkeletonItem repeat={3} />
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <Header
                title={t('bankSync.title')}
                titleSize='compact'
                breadcrumbs={[
                    { label: t('settings.title') },
                    { label: t('bankSync.breadcrumb.advanced') },
                    { label: t('bankSync.title') }
                ]}
            />

            <div className='flex flex-col space-y-6 w-full'>
                <div className='flex flex-row space-x-3'>
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-[300px]'
                        value={searchText}
                        onChange={onSearch}
                    />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    {filteredProviders.map(provider => (
                        <Box
                            key={provider.id}
                            title={provider.label}
                            logoIcon={provider.logoUrl}
                            header={<ProviderStatusBadge configured={provider.configured} />}
                        >
                            <BankConnectionCard
                                provider={provider}
                                connections={connectionsByProvider.get(provider.id) ?? []}
                            />
                        </Box>
                    ))}
                </div>
            </div>

            <BankAccountMappingDialog />
            <BankAppCredentialDialog />
        </PageWrapper>
    )
}
