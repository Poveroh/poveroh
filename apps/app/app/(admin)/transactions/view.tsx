'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { ArrowLeftRight, List, Plus, Search, Table, X } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { PageWrapper } from '@/components/box/page-wrapper'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'
import { FilterButton } from '@/components/filter/filter-button'
import { Header } from '@/components/other/header-page'
import Divider from '@/components/other/divider'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import { DataTable } from '@/components/table/data-table'

import { useTransaction } from '@/hooks/use-transaction'
import { useTransactionPagination } from '@/hooks/use-transaction-pagination'
import { useTransactionColumns } from '@/hooks/use-transaction-columns'
import { useTransactionFilterConfig } from '@/hooks/use-transaction-filter-config'
import { useCategory } from '@/hooks/use-category'
import { useFinancialAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useConfig } from '@/hooks/use-config'

import { MODAL_IDS } from '@/types/constant'
import { ViewModeType } from '@/types'
import { TransactionData, TransactionFilters } from '@poveroh/types'
import moment from 'moment-timezone'

export default function TransactionsView() {
    const t = useTranslations()
    const mainDivRef = useRef<HTMLDivElement | null>(null)

    const {
        createMutation,
        deleteAllMutation,
        groupTransactionsByDate,
        filters,
        activeFilters,
        updateFilters,
        removeFilter,
        onSearch
    } = useTransaction()

    const { categoryData } = useCategory()
    const { accountQuery } = useFinancialAccount()
    const { preferedLanguage } = useConfig()

    const { openModal } = useModal<TransactionData>(MODAL_IDS.TRANSACTION)
    const { openModal: openDeleteModal } = useDeleteModal<TransactionData>()

    const {
        viewMode,
        transactions,
        totalCount,
        isLoading,
        isLoadingMore,
        pageSize,
        handleViewModeChange,
        refetch,
        bindInfiniteScroll,
        handleTablePaginationChange,
        handleTableSortingChange
    } = useTransactionPagination({ activeFilters })

    const columns = useTransactionColumns({
        openEdit: item => openModal('edit', item),
        openDelete: openDeleteModal
    })

    const { filterFields, getFilterLabel } = useTransactionFilterConfig()

    useEffect(() => {
        return bindInfiniteScroll(mainDivRef)
    }, [bindInfiniteScroll])

    const listContent = useMemo(() => {
        if (transactions.length === 0) return null

        return Object.entries(groupTransactionsByDate(transactions))
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayTransactions]) => {
                const dailyTotal = dayTransactions.reduce((sum, transaction) => {
                    const amount = transaction.amounts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
                    if (transaction.action === 'EXPENSES') return sum - amount
                    if (transaction.action === 'INCOME') return sum + amount
                    return sum
                }, 0)

                const currentYear = moment().year()
                const dateMoment = moment(date)
                const isCurrentYear = dateMoment.year() === currentYear
                const dateLabel = (
                    isCurrentYear ? dateMoment.format('D MMMM') : dateMoment.format('D MMMM YYYY')
                ).toLocaleLowerCase(preferedLanguage)

                return (
                    <div key={date} className='flex flex-col space-y-2'>
                        <div className='flex flex-row justify-between'>
                            <h4>{dateLabel}</h4>
                            <p>
                                {dailyTotal !== 0 && <span>{dailyTotal > 0 ? '+' : ''}</span>}
                                {dailyTotal.toFixed(2)}
                            </p>
                        </div>
                        <Box>
                            {dayTransactions.map(transaction => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    openEdit={(item: TransactionData) => openModal('edit', item)}
                                    openDelete={openDeleteModal}
                                />
                            ))}
                        </Box>
                    </div>
                )
            })
    }, [transactions, preferedLanguage])

    const pageContent = useMemo(() => {
        if (isLoading && transactions.length === 0) {
            return <SkeletonItem repeat={5} />
        }

        if (transactions.length > 0) {
            if (viewMode === 'table') {
                return (
                    <DataTable
                        data={transactions}
                        columns={columns}
                        manualPagination
                        pageCount={Math.ceil(totalCount / pageSize)}
                        onPaginationChange={handleTablePaginationChange}
                        manualSorting
                        onSortingChange={handleTableSortingChange}
                        isLoading={isLoading}
                    />
                )
            }

            return (
                <>
                    {listContent}
                    {isLoadingMore && (
                        <div className='flex justify-center items-center w-full py-4'>
                            <p className='text-muted-foreground'>{t('messages.loading')}...</p>
                        </div>
                    )}
                </>
            )
        }

        if (Object.keys(activeFilters).length > 0) {
            return (
                <div className='flex justify-center w-full pt-20'>
                    <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                        <Search className='w-16 h-16 text-muted-foreground' />
                        <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                            <h4>{t('messages.noResults')}</h4>
                            <p className='text-muted-foreground'>{t('messages.tryAdjustingFilters')}</p>
                        </div>
                        <Button variant='outline' onClick={() => updateFilters({} as TransactionFilters)}>
                            {t('messages.clearFilters')}
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className='flex justify-center w-full pt-20'>
                <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                    <ArrowLeftRight className='w-16 h-16' />
                    <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                        <h4>{t('transactions.empty.title')}</h4>
                        <p className='text-muted-foreground'>{t('transactions.empty.subtitle')}</p>
                    </div>
                    {(accountQuery.data?.data.length == 0 || categoryData.length == 0) && (
                        <>
                            <Divider />
                            <div className='flex flex-col items-center space-y-8 justify-center'>
                                <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                                    <p className='warning'>{t('messages.noCategoriesAndAccountTitle')}</p>
                                    <p className='warning'>{t('messages.noCategoriesAndAccountSub')}</p>
                                </div>
                                <div className='flex flex-row space-x-4'>
                                    <Link href='/accounts'>
                                        <Button variant='outline'>
                                            <Plus />
                                            {t('accounts.title')}
                                        </Button>
                                    </Link>
                                    <Link href='/categories'>
                                        <Button variant='outline'>
                                            <Plus />
                                            {t('categories.title')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }, [
        isLoading,
        transactions,
        viewMode,
        activeFilters,
        categoryData,
        accountQuery.data,
        listContent,
        isLoadingMore,
        totalCount
    ])

    return (
        <>
            <PageWrapper>
                <div ref={mainDivRef} className='space-y-12 w-full'>
                    <Header
                        title={t('transactions.title')}
                        breadcrumbs={[{ label: t('dashboard.title'), href: '/' }, { label: t('transactions.title') }]}
                        fetchAction={{
                            onClick: refetch,
                            loading: isLoading
                        }}
                        addAction={{
                            onClick: () => openModal('create'),
                            loading: createMutation.isPending
                        }}
                        onDeleteAll={{
                            onClick: () => deleteAllMutation.mutate({}),
                            loading: deleteAllMutation.isPending
                        }}
                    />

                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-row space-x-3'>
                            <Input
                                startIcon={Search}
                                placeholder={t('messages.search')}
                                className='w-80'
                                onChange={onSearch}
                            />

                            {Object.entries(filters).map(([key, value]) => (
                                <Button
                                    key={key}
                                    variant='secondary'
                                    className='flex items-center gap-1'
                                    onClick={() => removeFilter(key as keyof TransactionFilters)}
                                >
                                    {getFilterLabel(key as keyof TransactionFilters, value)}
                                    <X />
                                </Button>
                            ))}

                            <FilterButton<TransactionFilters>
                                fields={filterFields}
                                filters={filters}
                                onFilterChange={updateFilters}
                            />
                        </div>

                        <Tabs
                            defaultValue={viewMode}
                            value={viewMode}
                            className='w-[200px]'
                            onValueChange={x => handleViewModeChange(x as ViewModeType)}
                        >
                            <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value='list' className='flex items-center gap-2'>
                                    <List />
                                    {t('layout.viewMode.list')}
                                </TabsTrigger>
                                <TabsTrigger value='table' className='flex items-center gap-2'>
                                    <Table />
                                    {t('layout.viewMode.table')}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {pageContent}
                </div>
            </PageWrapper>

            <TransactionDialog />
        </>
    )
}
