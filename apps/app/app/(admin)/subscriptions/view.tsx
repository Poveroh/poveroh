'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'

import { Download, Landmark, Plus, RotateCcw, Search, X } from 'lucide-react'

import Box from '@/components/box/boxWrapper'
import { DeleteModal } from '@/components/modal/delete'
import { BankAccountDialog } from '@/components/dialog/bankAccountDialog'

import { IBankAccountFilters, ISubscription } from '@poveroh/types'

import { BankAccountItem } from '@/components/item/bank-account.item'
import { FilterButton } from '@/components/filter/FilterButton'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { SubscriptionItem } from '@/components/item/subscription.item'
import { SubscriptionDialog } from '@/components/dialog/subscriptions.dialog'

export default function SubscriptionsView() {
    const t = useTranslations()

    const { subscriptionCacheList, removeSubscription, fetchSubscriptions } = useSubscriptions()

    const [itemToDelete, setItemToDelete] = useState<ISubscription | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ISubscription | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localSubscriptionList, setLocalSubscriptionList] = useState<ISubscription[]>(subscriptionCacheList)

    const [filters, setFilters] = useState<IBankAccountFilters>({})

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    useEffect(() => {
        setLocalSubscriptionList(subscriptionCacheList)
    }, [subscriptionCacheList])

    const onFilter = (filter: IBankAccountFilters = {}) => {
        // const updatedFilter = { ...filter }
        // const filteredList = bankAccountCacheList.filter(account => {
        //     const titleMatch = updatedFilter.title?.contains
        //         ? account.title?.toLowerCase().includes(updatedFilter.title.contains.toLowerCase())
        //         : true
        //     const descriptionMatch = updatedFilter.description?.contains
        //         ? account.description?.toLowerCase().includes(updatedFilter.description.contains.toLowerCase())
        //         : true
        //     const typeMatch = updatedFilter.type ? account.type === updatedFilter.type : true
        //     return titleMatch && descriptionMatch && typeMatch
        // })
        // setFilters(updatedFilter)
        // setLocalSubscriptionList(filteredList)
    }

    const removeFilter = (key: keyof IBankAccountFilters) => {
        const newFilters: IBankAccountFilters = { ...filters }
        delete newFilters[key]

        if (key === 'title' || key === 'description') {
            delete newFilters[key]
        }

        onFilter(newFilters)
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        const newFilters: IBankAccountFilters = {
            ...filters,
            title: textToSearch ? { contains: textToSearch } : undefined,
            description: textToSearch ? { contains: textToSearch } : undefined
        }

        onFilter(newFilters)
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
                <div className='flex flex-row items-end justify-between'>
                    <div className='flex flex-col space-y-3'>
                        <h2>{t('subscriptions.title')}</h2>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.manage.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('subscriptions.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchSubscriptions} />
                        <div className='flex flex-row items-center space-x-3'>
                            <Button variant='outline'>
                                <Download></Download>
                                {t('buttons.export.base')}
                            </Button>
                            <Button onClick={() => setDialogNewOpen(true)}>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row space-x-3'>
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-1/3'
                        onChange={onSearch}
                    />

                    {Object.entries(filters)
                        .filter(([key]) => key === 'type')
                        .map(([key, value]) => {
                            if (!value) return null

                            // const item = typeList.find(x => x.value == value)

                            // if (!false) return
                            return <></>

                            // return (
                            //     <Button
                            //         key={key}
                            //         variant='secondary'
                            //         className='flex items-center gap-1'
                            //         onClick={() => removeFilter(key as keyof IBankAccountFilters)}
                            //     >
                            //         {item.label}
                            //         <X />
                            //     </Button>
                            // )
                        })}

                    <FilterButton
                        fields={
                            [
                                // {
                                //     name: 'type',
                                //     label: 'form.type.label',
                                //     type: 'select',
                                //     options: typeList
                                // }
                            ]
                        }
                        filters={filters}
                        onFilterChange={onFilter}
                    />
                </div>
                {localSubscriptionList.length > 0 ? (
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
                            <h4>{t('bankAccounts.empty.title')}</h4>
                            <p>{t('bankAccounts.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            {itemToDelete && (
                <DeleteModal
                    title={itemToDelete.title}
                    description={t('bankAccounts.modal.deleteDescription')}
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
                    closeDialog={() => setDialogNewOpen(false)}
                ></SubscriptionDialog>
            )}

            {itemToEdit && (
                <SubscriptionDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                ></SubscriptionDialog>
            )}
        </>
    )
}
