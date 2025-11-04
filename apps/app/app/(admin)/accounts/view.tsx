'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { IFinancialAccount, IFinancialAccountFilters } from '@poveroh/types'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'

import { Landmark, Search, X } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { AccountDialog } from '@/components/dialog/account-dialog'
import { AccountItem } from '@/components/item/account-item'
import { FilterButton } from '@/components/filter/filter-button'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'

import { useAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export default function AccountView() {
    const t = useTranslations()

    const { accountCacheList, fetchAccount, typeList, accountLoading } = useAccount()

    const { openModal } = useModal<IFinancialAccount>()
    const { openModal: openDeleteModal } = useDeleteModal<IFinancialAccount>()

    const [localAccountList, setLocalAccountList] = useState<IFinancialAccount[]>(accountCacheList)

    const [filters, setFilters] = useState<IFinancialAccountFilters>({})

    useEffect(() => {
        fetchAccount()
    }, [])

    useEffect(() => {
        setLocalAccountList(accountCacheList)
    }, [accountCacheList])

    const onFilter = (filter: IFinancialAccountFilters = {}) => {
        const updatedFilter = { ...filter }

        const filteredList = accountCacheList.filter(account => {
            const titleMatch = updatedFilter.title?.contains
                ? account.title?.toLowerCase().includes(updatedFilter.title.contains.toLowerCase())
                : true

            const descriptionMatch = updatedFilter.description?.contains
                ? account.description?.toLowerCase().includes(updatedFilter.description.contains.toLowerCase())
                : true

            const typeMatch = updatedFilter.type ? account.type === updatedFilter.type : true

            return titleMatch && descriptionMatch && typeMatch
        })

        setFilters(updatedFilter)
        setLocalAccountList(filteredList)
    }

    const removeFilter = (key: keyof IFinancialAccountFilters) => {
        const newFilters: IFinancialAccountFilters = { ...filters }
        delete newFilters[key]

        if (key === 'title' || key === 'description') {
            delete newFilters[key]
        }

        onFilter(newFilters)
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        const newFilters: IFinancialAccountFilters = {
            ...filters,
            title: textToSearch ? { contains: textToSearch } : undefined,
            description: textToSearch ? { contains: textToSearch } : undefined
        }

        onFilter(newFilters)
    }

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('settings.manage.account.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings/manage' },
                        { label: t('settings.manage.account.title') }
                    ]}
                    fetchAction={{
                        onClick: () => fetchAccount(true),
                        loading: accountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => {
                            openModal('create')
                        },
                        loading: accountLoading.add
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: accountLoading.remove
                    }}
                />

                <div className='flex flex-row space-x-6 w-full'>
                    <div className='flex flex-row space-x-3'>
                        <Input
                            startIcon={Search}
                            placeholder={t('messages.search')}
                            className='w-[300px]'
                            onChange={onSearch}
                        />

                        {Object.entries(filters)
                            .filter(([key]) => key === 'type')
                            .map(([key, value]) => {
                                if (!value) return null

                                const item = typeList.find(x => x.value == value)

                                if (!item) return

                                return (
                                    <Button
                                        key={key}
                                        variant='secondary'
                                        className='flex items-center gap-1'
                                        onClick={() => removeFilter(key as keyof IFinancialAccountFilters)}
                                    >
                                        {item.label}
                                        <X />
                                    </Button>
                                )
                            })}
                    </div>

                    <FilterButton
                        fields={[
                            {
                                name: 'type',
                                label: 'form.type.label',
                                type: 'select',
                                options: typeList
                            }
                        ]}
                        filters={filters}
                        onFilterChange={onFilter}
                    />
                </div>
                {!accountLoading.fetch && localAccountList.length > 0 ? (
                    <Box>
                        <>
                            {localAccountList.map(account => (
                                <AccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={(item: IFinancialAccount) => {
                                        openModal('edit', item)
                                    }}
                                    openDelete={openDeleteModal}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <>
                        {accountLoading.fetch ? (
                            <SkeletonItem repeat={5} />
                        ) : (
                            <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                                <Landmark />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('accounts.empty.title')}</h4>
                                    <p>{t('accounts.empty.subtitle')}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AccountDialog></AccountDialog>
        </>
    )
}
