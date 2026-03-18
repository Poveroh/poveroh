'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'

import { Landmark, Search, X } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { AccountDialog } from '@/components/dialog/account-dialog'
import { AccountBalanceSnapshotDialog } from '@/components/dialog/account-balance-snapshot-dialog'
import { AccountItem } from '@/components/item/account-item'
import { FilterButton } from '@/components/filter/filter-button'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'

import { useFinancialAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { PageWrapper } from '@/components/box/page-wrapper'
import { FinancialAccountData, FinancialAccountTypeEnum, SnapshotAccountBalance } from '@poveroh/types/contracts'

type AccountFilters = {
    title?: { contains?: string }
    description?: { contains?: string }
    type?: FinancialAccountTypeEnum
}

export default function AccountView() {
    const t = useTranslations()

    const { financialAccountCacheList, fetchFinancialAccounts, TYPE_LIST, financialAccountLoading } =
        useFinancialAccount()

    const { openModal } = useModal<FinancialAccountData>('account')
    const { openModal: openSnapshotModal } = useModal<SnapshotAccountBalance>('account-snapshot')
    const { openModal: openDeleteModal } = useDeleteModal<FinancialAccountData>()

    const [localAccountList, setLocalAccountList] = useState<FinancialAccountData[]>(financialAccountCacheList)

    const [filters, setFilters] = useState<AccountFilters>({})

    useEffect(() => {
        fetchFinancialAccounts()
    }, [])

    useEffect(() => {
        setLocalAccountList(financialAccountCacheList)
    }, [financialAccountCacheList])

    const onFilter = (filter: AccountFilters = {}) => {
        const updatedFilter = { ...filter }

        const filteredList = financialAccountCacheList.filter(account => {
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

    const removeFilter = (key: keyof AccountFilters) => {
        const newFilters: AccountFilters = { ...filters }
        delete newFilters[key]

        if (key === 'title' || key === 'description') {
            delete newFilters[key]
        }

        onFilter(newFilters)
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        const newFilters: AccountFilters = {
            ...filters,
            title: textToSearch ? { contains: textToSearch } : undefined,
            description: textToSearch ? { contains: textToSearch } : undefined
        }

        onFilter(newFilters)
    }

    return (
        <>
            <PageWrapper>
                <Header
                    title={t('settings.manage.account.title')}
                    titleSize='compact'
                    breadcrumbs={[
                        { label: t('settings.title') },
                        { label: t('settings.manage.title') },
                        { label: t('settings.manage.account.title') }
                    ]}
                    fetchAction={{
                        onClick: fetchFinancialAccounts,
                        loading: financialAccountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => {
                            openModal('create')
                        },
                        loading: financialAccountLoading.create
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: financialAccountLoading.delete
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

                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null

                            const item = TYPE_LIST.find(x => x.value == value)

                            if (!item) return

                            return (
                                <Button
                                    key={key}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                    onClick={() => removeFilter(key as keyof AccountFilters)}
                                >
                                    {item.label}
                                    <X />
                                </Button>
                            )
                        })}
                    </div>

                    <FilterButton<AccountFilters>
                        fields={[
                            {
                                name: 'type',
                                label: 'form.type.label',
                                type: 'select',
                                options: TYPE_LIST
                            }
                        ]}
                        filters={filters}
                        onFilterChange={onFilter}
                    />
                </div>
                {!financialAccountLoading.fetch && localAccountList.length > 0 ? (
                    <Box>
                        <>
                            {localAccountList.map(account => (
                                <AccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={(item: FinancialAccountData) => {
                                        openModal('edit', item)
                                    }}
                                    openDelete={openDeleteModal}
                                    buttons={[
                                        {
                                            onClick: x => {
                                                openSnapshotModal('create', undefined, { accountId: x.id })
                                            },
                                            label: t('accounts.snapshot.button'),
                                            icon: 'calendar-plus'
                                        }
                                    ]}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <>
                        {financialAccountLoading.fetch ? (
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
            </PageWrapper>

            <AccountDialog></AccountDialog>
            <AccountBalanceSnapshotDialog />
        </>
    )
}
