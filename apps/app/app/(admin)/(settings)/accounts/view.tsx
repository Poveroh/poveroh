'use client'

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
import { FinancialAccountData, FinancialAccountFilters, SnapshotAccountBalance } from '@poveroh/types'

export default function AccountView() {
    const t = useTranslations()

    const {
        accountQuery,
        createMutation,
        deleteMutation,
        ACCOUNT_TYPE_CATALOG,
        filters,
        updateFilters,
        removeFilter,
        onSearch
    } = useFinancialAccount()

    const { openModal } = useModal<FinancialAccountData>('account')
    const { openModal: openSnapshotModal } = useModal<SnapshotAccountBalance>('account-snapshot')
    const { openModal: openDeleteModal } = useDeleteModal<FinancialAccountData>()

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
                        onClick: accountQuery.refetch,
                        loading: accountQuery.isPending
                    }}
                    addAction={{
                        onClick: () => {
                            openModal('create')
                        },
                        loading: createMutation.isPending
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: deleteMutation.isPending
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

                            const item = ACCOUNT_TYPE_CATALOG.find(x => x.value == value)

                            if (!item) return

                            return (
                                <Button
                                    key={key}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                    onClick={() => removeFilter(key as keyof FinancialAccountFilters)}
                                >
                                    {item.label}
                                    <X />
                                </Button>
                            )
                        })}
                    </div>

                    <FilterButton<FinancialAccountFilters>
                        fields={[
                            {
                                name: 'type',
                                label: 'form.type.label',
                                type: 'select',
                                options: ACCOUNT_TYPE_CATALOG
                            }
                        ]}
                        filters={filters}
                        onFilterChange={updateFilters}
                    />
                </div>
                {!accountQuery.isPending && accountQuery.data && accountQuery.data?.data.length > 0 ? (
                    <Box>
                        {accountQuery.data?.data.map(account => (
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
                    </Box>
                ) : (
                    <>
                        {accountQuery.isPending ? (
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

            <AccountDialog />
            <AccountBalanceSnapshotDialog />
        </>
    )
}
