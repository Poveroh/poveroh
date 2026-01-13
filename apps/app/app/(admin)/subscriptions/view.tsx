'use client'

import { useEffect, useState } from 'react'

import { isEmpty } from '@poveroh/utils'
import { useTranslations } from 'next-intl'

import { Input } from '@poveroh/ui/components/input'
import { Landmark, Search } from 'lucide-react'

import { ISubscription } from '@poveroh/types'

import { useSubscription } from '@/hooks/use-subscriptions'
import { useFinancialAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

import { SubscriptionDialog } from '@/components/dialog/subscription-dialog'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import Box from '@/components/box/box-wrapper'
import { SubscriptionItem } from '@/components/item/subscriptions-item'
import { Header } from '@/components/other/header-page'
import { PageWrapper } from '@/components/box/page-wrapper'

export default function SubscriptionsView() {
    const t = useTranslations()

    const { subscriptionCacheList, fetchSubscriptions, subscriptionLoading } = useSubscription()
    const { fetchFinancialAccount } = useFinancialAccount()

    const { openModal } = useModal<ISubscription>()
    const { openModal: openDeleteModal } = useDeleteModal<ISubscription>()

    const [localSubscriptionList, setLocalSubscriptionList] = useState<ISubscription[]>(subscriptionCacheList)
    const total = localSubscriptionList.reduce((sum, sub) => sum + Number(sub.amount || 0), 0)
    const subscriptionsTotal = parseFloat(total.toFixed(2))

    useEffect(() => {
        fetchSubscriptions()
        fetchFinancialAccount()
    }, [])

    useEffect(() => {
        setLocalSubscriptionList(subscriptionCacheList)
    }, [subscriptionCacheList])

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (isEmpty(textToSearch)) {
            setLocalSubscriptionList(subscriptionCacheList)
            return
        }

        const filteredList = localSubscriptionList.filter(x => x.title.toLowerCase().includes(textToSearch))

        setLocalSubscriptionList(filteredList)
    }

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
                        onClick: fetchSubscriptions,
                        loading: subscriptionLoading.fetch
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: subscriptionLoading.add
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: subscriptionLoading.remove
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
                {subscriptionLoading.fetch ? (
                    <SkeletonItem repeat={5} />
                ) : localSubscriptionList.length > 0 ? (
                    <Box>
                        <>
                            {localSubscriptionList.map(item => (
                                <SubscriptionItem
                                    key={item.id}
                                    subscription={item}
                                    openEdit={(item: ISubscription) => {
                                        openModal('edit', item)
                                    }}
                                    openDelete={openDeleteModal}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                        <Landmark />
                        <div className='flex flex-col items-center space-y-2 justify-center'>
                            <h4>{t('subscriptions.empty.title')}</h4>
                            <p>{t('subscriptions.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </PageWrapper>

            <SubscriptionDialog></SubscriptionDialog>
        </>
    )
}
