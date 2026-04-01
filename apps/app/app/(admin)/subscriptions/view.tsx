'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@poveroh/ui/components/input'
import { Landmark, Search } from 'lucide-react'

import { useSubscription } from '@/hooks/use-subscriptions'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

import { SubscriptionDialog } from '@/components/dialog/subscription-dialog'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import Box from '@/components/box/box-wrapper'
import { SubscriptionItem } from '@/components/item/subscriptions-item'
import { Header } from '@/components/other/header-page'
import { PageWrapper } from '@/components/box/page-wrapper'
import { SubscriptionData } from '@poveroh/types'
import { MODAL_IDS } from '@/types/constant'

export default function SubscriptionsView() {
    const t = useTranslations()

    const {
        subscriptionQuery,
        createMutation,
        deleteMutation,
        onSearch
    } = useSubscription()

    const { openModal } = useModal<SubscriptionData>(MODAL_IDS.SUBSCRIPTION)
    const { openModal: openDeleteModal } = useDeleteModal<SubscriptionData>()

    const subscriptionsTotal = useMemo(() => {
        if (!subscriptionQuery.data?.data) return 0
        const total = (subscriptionQuery.data.data as SubscriptionData[]).reduce(
            (sum, sub) => sum + Number(sub.amount || 0),
            0
        )
        return parseFloat(total.toFixed(2))
    }, [subscriptionQuery.data])

    const pageContent = useMemo(() => {
        if (subscriptionQuery.isPending) {
            return <SkeletonItem repeat={5} />
        }

        if (subscriptionQuery.data && subscriptionQuery.data?.data.length > 0) {
            return (
                <Box>
                    {(subscriptionQuery.data.data as SubscriptionData[]).map(item => (
                        <SubscriptionItem
                            key={item.id}
                            subscription={item}
                            openEdit={(item: SubscriptionData) => {
                                openModal('edit', item)
                            }}
                            openDelete={openDeleteModal}
                        />
                    ))}
                </Box>
            )
        }

        return (
            <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                <Landmark />
                <div className='flex flex-col items-center space-y-2 justify-center'>
                    <h4>{t('subscriptions.empty.title')}</h4>
                    <p>{t('subscriptions.empty.subtitle')}</p>
                </div>
            </div>
        )
    }, [subscriptionQuery.isPending, subscriptionQuery.data])

    return (
        <>
            <PageWrapper>
                <Header
                    title={t('subscriptions.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings' },
                        { label: t('subscriptions.title') }
                    ]}
                    fetchAction={{
                        onClick: subscriptionQuery.refetch,
                        loading: subscriptionQuery.isPending
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: createMutation.isPending
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: deleteMutation.isPending
                    }}
                />

                <div className='flex flex-row items-center justify-between'>
                    <div className='flex flex-row space-x-3'>
                        <Input
                            startIcon={Search}
                            placeholder={t('messages.search')}
                            className='w-[20vw]'
                            onChange={onSearch}
                        />
                    </div>
                    <p>
                        {t('subscriptions.total', {
                            a: subscriptionsTotal
                        })}
                    </p>
                </div>

                {pageContent}
            </PageWrapper>

            <SubscriptionDialog />
        </>
    )
}
