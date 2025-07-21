'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { isEmpty } from 'lodash'

import { Input } from '@poveroh/ui/components/input'

import { Landmark, Search } from 'lucide-react'

import { ISubscription } from '@poveroh/types'

import { SubscriptionDialog } from '@/components/dialog/SubscriptionDialog'
import { DeleteModal } from '@/components/modal/DeleteModal'

import { useBankAccount } from '@/hooks/useBankAccount'
import { useSubscription } from '@/hooks/useSubscriptions'
import SkeletonItem from '@/components/skeleton/SkeletonItem'
import Box from '@/components/box/BoxWrapper'
import { SubscriptionItem } from '@/components/item/SubscriptionsItem'
import { Header } from '@/components/other/HeaderPage'

export default function SubscriptionsView() {
    const t = useTranslations()

    const { subscriptionCacheList, removeSubscription, fetchSubscriptions, subscriptionLoading } = useSubscription()
    const { fetchBankAccount } = useBankAccount()

    const [itemToDelete, setItemToDelete] = useState<ISubscription | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ISubscription | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)

    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)

    const [localSubscriptionList, setLocalSubscriptionList] = useState<ISubscription[]>(subscriptionCacheList)
    const subscriptionsTotal = parseFloat(localSubscriptionList.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2))

    useEffect(() => {
        fetchData()
        fetchBankAccount()
    }, [])

    const fetchData = () => {
        setLoadingData(true)
        fetchSubscriptions()
        setLoadingData(false)
    }

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

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await removeSubscription(itemToDelete.id)

        setLoading(false)

        if (res) {
            setItemToDelete(null)
        }
    }

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('subscriptions.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings' },
                        { label: t('subscriptions.title') }
                    ]}
                    fetchAction={{
                        onClick: fetchData,
                        loading: subscriptionLoading.fetch
                    }}
                    addAction={{
                        onClick: () => setDialogNewOpen(true),
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
                {loadingData ? (
                    <SkeletonItem repeat={5} />
                ) : localSubscriptionList.length > 0 ? (
                    <Box>
                        <>
                            {localSubscriptionList.map(item => (
                                <SubscriptionItem
                                    key={item.id}
                                    subscription={item}
                                    openEdit={setItemToEdit}
                                    openDelete={setItemToDelete}
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
            </div>

            {itemToDelete && (
                <DeleteModal
                    title={itemToDelete.title}
                    description={t('subscriptions.modal.deleteDescription')}
                    open={true}
                    closeDialog={() => setItemToDelete(null)}
                    loading={loading}
                    onConfirm={onDelete}
                ></DeleteModal>
            )}

            {dialogNewOpen && (
                <SubscriptionDialog
                    open={dialogNewOpen}
                    inEditingMode={false}
                    dialogHeight='h-[80vh]'
                    closeDialog={() => setDialogNewOpen(false)}
                ></SubscriptionDialog>
            )}

            {itemToEdit && (
                <SubscriptionDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    dialogHeight='h-[80vh]'
                    closeDialog={() => setItemToEdit(null)}
                ></SubscriptionDialog>
            )}
        </>
    )
}
