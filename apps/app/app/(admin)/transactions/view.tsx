'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { Input } from '@poveroh/ui/components/input'

import { ArrowLeftRight, ArrowUpDown, List, Plus, Search, Table, X } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'
import { FilterButton } from '@/components/filter/filter-button'

import { useTransaction } from '@/hooks/use-transaction'
import { useCategory } from '@/hooks/use-category'
import { useFinancialAccount } from '@/hooks/use-account'

import {
    IFilterOptions,
    ITransaction,
    ITransactionFilters,
    TransactionAction,
    FilterField,
    DateFilter,
    TransactionsFilterTypes
} from '@poveroh/types'

import { isEmpty } from '@poveroh/utils'
import Divider from '@/components/other/divider'
import { Header } from '@/components/other/header-page'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

import { DataTable } from '@/components/table/data-table'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import { type ColumnDef } from '@tanstack/react-table'
import { OptionsPopover } from '@/components/navbar/options-popover'
import { cn } from '@poveroh/ui/lib/utils'
import { storage } from '@/lib/storage'
import { ViewModeType } from '@/types'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { useConfig } from '@/hooks/use-config'

export default function TransactionsView() {
    const t = useTranslations()
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        transactionCacheList,
        fetchTransaction,
        fetchTransactionPaginated,
        groupTransactionsByDate,
        transactionLoading
    } = useTransaction()
    const { categoryCacheList, fetchCategory, categoryLoading } = useCategory()
    const { financialAccountCacheList, fetchFinancialAccount, financialAccountLoading } = useFinancialAccount()
    const { renderDate } = useConfig()

    const { openModal } = useModal<ITransaction>()
    const { openModal: openDeleteModal } = useDeleteModal<ITransaction>()

    const [localTransactionList, setLocalTransactionList] = useState<ITransaction[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])

    const [viewMode, setViewMode] = useState<ViewModeType>(() => {
        const saved = storage.get('transactionViewMode')
        return (saved as ViewModeType) || 'list'
    })

    const [transactionFilterSetting, setTransactionFilterSetting] = useState<IFilterOptions>({
        skip: 0,
        take: 20
    })

    // Initialize filters from URL parameters
    const [filters, setFilters] = useState<ITransactionFilters>(() => {
        const params: ITransactionFilters = {}
        const categoryId = searchParams.get('categoryId')
        const subcategoryId = searchParams.get('subcategoryId')
        const financialAccountId = searchParams.get('financialAccountId')
        const type = searchParams.get('type')
        const fromDate = searchParams.get('fromDate')
        const toDate = searchParams.get('toDate')

        if (categoryId) params.categoryId = categoryId
        if (subcategoryId) params.subcategoryId = subcategoryId
        if (financialAccountId) params.financialAccountId = financialAccountId
        if (type) params.type = type as TransactionAction
        if (fromDate || toDate) {
            params.date = {}
            if (fromDate) params.date.gte = fromDate
            if (toDate) params.date.lte = toDate
        }

        return params
    })

    useEffect(() => {
        fetchCategory()
        fetchFinancialAccount()

        // Load initial data based on view mode
        if (viewMode === 'table') {
            loadTransactionsPaginated(transactionFilterSetting)
        } else {
            fetchTransaction(filters, transactionFilterSetting)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLocalTransactionList(transactionCacheList)
    }, [transactionCacheList])

    // Handle view mode change and reload data accordingly
    const handleViewModeChange = async (newMode: ViewModeType) => {
        setViewMode(newMode)
        storage.set('transactionViewMode', newMode)

        if (newMode === 'table') {
            await loadTransactionsPaginated(transactionFilterSetting)
        } else {
            // Reset to initial state for list view
            const initialOptions = { skip: 0, take: 20 }
            setTransactionFilterSetting(initialOptions)
            await fetchTransaction(filters, initialOptions)
        }
    }

    // Infinite scroll: automatically load more transactions when you reach the bottom
    useEffect(() => {
        const handleScroll = () => {
            if (isLoadingMore || transactionLoading.fetch || viewMode === 'table') {
                return
            }

            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const scrollHeight = document.documentElement.scrollHeight
            const clientHeight = window.innerHeight

            // Load when you're 100px from the bottom
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore()
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadingMore, viewMode, filters, transactionFilterSetting])

    // Sync filters to URL parameters
    const updateURLParams = (newFilters: ITransactionFilters) => {
        const params = new URLSearchParams()

        if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId)
        if (newFilters.subcategoryId) params.set('subcategoryId', newFilters.subcategoryId)
        if (newFilters.financialAccountId) params.set('financialAccountId', newFilters.financialAccountId)
        if (newFilters.type) params.set('type', newFilters.type)
        if (newFilters.date?.gte) params.set('fromDate', newFilters.date.gte)
        if (newFilters.date?.lte) params.set('toDate', newFilters.date.lte)

        const queryString = params.toString()
        const newPath = queryString ? `/transactions?${queryString}` : '/transactions'
        router.replace(newPath, { scroll: false })
    }

    const handleFilterChange = (newFilters: ITransactionFilters) => {
        setFilters(newFilters)
        updateURLParams(newFilters)

        // Reset to first page and reload data
        const newOptions = { skip: 0, take: 20 }
        setTransactionFilterSetting(newOptions)

        if (viewMode === 'table') {
            loadTransactionsPaginated(newOptions, newFilters)
        } else {
            // For list view, fetch fresh data (not append) and force fetch
            fetchTransaction(newFilters, newOptions, false, true)
        }
    }

    const loadTransactionsPaginated = async (options: IFilterOptions, filtersToUse?: ITransactionFilters) => {
        // Use provided filters or fall back to state filters
        const activeFilters = filtersToUse !== undefined ? filtersToUse : filters

        // Add sorting to options if present
        const optionsWithSort = {
            ...options,
            ...(sorting.length > 0 &&
                sorting[0] && {
                    sortBy: sorting[0].id,
                    sortOrder: sorting[0].desc ? ('desc' as const) : ('asc' as const)
                })
        }
        const result = await fetchTransactionPaginated(activeFilters, optionsWithSort)
        if (result) {
            setTotalCount(result.total)
        }
    }

    const loadMore = async () => {
        if (isLoadingMore) return

        setIsLoadingMore(true)

        const currentSkip = transactionFilterSetting.skip ?? 0
        const currentTake = transactionFilterSetting.take ?? 20

        const newOptions = {
            skip: currentSkip + currentTake,
            take: currentTake
        }

        await fetchTransaction(filters, newOptions, true, true)

        setTransactionFilterSetting(newOptions)
        setIsLoadingMore(false)
    }

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (viewMode === 'list') {
            // For list view, filter locally from cache
            if (isEmpty(textToSearch)) {
                setLocalTransactionList(transactionCacheList)
                return
            }

            const filteredList = transactionCacheList.filter(x =>
                x.title.toLowerCase().includes(textToSearch.toLowerCase())
            )
            setLocalTransactionList(filteredList)
        }
        // For table view, filtering is handled by the table component itself
    }

    const handleTablePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
        const newOptions = {
            skip: pagination.pageIndex * pagination.pageSize,
            take: pagination.pageSize
        }
        setTransactionFilterSetting(newOptions)
        loadTransactionsPaginated(newOptions)
    }

    const handleTableSortingChange = (newSorting: { id: string; desc: boolean }[]) => {
        setSorting(newSorting)
        // Reset to first page when sorting changes
        const newOptions = {
            ...transactionFilterSetting,
            skip: 0
        }
        setTransactionFilterSetting(newOptions)
        loadTransactionsPaginated(newOptions)
    }

    // Define filter fields
    const filterFields: FilterField[] = [
        {
            name: 'type',
            label: 'form.type.label',
            type: 'select',
            options: [
                { label: 'Income', value: TransactionAction.INCOME },
                { label: 'Expense', value: TransactionAction.EXPENSES }
            ]
        },
        {
            name: 'categoryId',
            label: 'form.category.label',
            type: 'select',
            options: categoryCacheList.map(cat => ({
                label: cat.title,
                value: cat.id
            }))
        },
        {
            name: 'financialAccountId',
            label: 'form.account.label',
            type: 'select',
            options: financialAccountCacheList.map(acc => ({
                label: acc.title,
                value: acc.id
            }))
        },
        {
            fromName: 'fromDate',
            toName: 'toDate',
            label: 'form.date.label',
            type: 'dateRange'
        }
    ]

    const handleFlatFilterChange = (newFlatFilters: ITransactionFilters) => {
        const newFilters: ITransactionFilters = {}

        if (newFlatFilters.type) {
            newFilters.type = newFlatFilters.type as TransactionAction
        }
        if (newFlatFilters.categoryId && newFlatFilters.categoryId !== '') {
            newFilters.categoryId = newFlatFilters.categoryId
        }
        if (newFlatFilters.subcategoryId && newFlatFilters.subcategoryId !== '') {
            newFilters.subcategoryId = newFlatFilters.subcategoryId
        }
        if (newFlatFilters.financialAccountId && newFlatFilters.financialAccountId !== '') {
            newFilters.financialAccountId = newFlatFilters.financialAccountId
        }
        if (newFlatFilters.fromDate && newFlatFilters.fromDate !== '') {
            const fromDate = typeof newFlatFilters.fromDate === 'string' ? newFlatFilters.fromDate : undefined
            if (fromDate) {
                newFilters.date = { ...newFilters.date, gte: fromDate }
            }
        }
        if (newFlatFilters.toDate && newFlatFilters.toDate !== '') {
            const toDate = typeof newFlatFilters.toDate === 'string' ? newFlatFilters.toDate : undefined
            if (toDate) {
                newFilters.date = { ...newFilters.date, lte: toDate }
            }
        }

        handleFilterChange(newFilters)
    }

    const removeFilter = (key: keyof ITransactionFilters) => {
        const newFilters: ITransactionFilters = { ...filters }

        if (key === 'date') {
            delete newFilters.date
        } else {
            delete newFilters[key]
        }

        handleFilterChange(newFilters)
    }

    const getFilterLabel = (key: keyof ITransactionFilters, value: TransactionsFilterTypes) => {
        if (key === 'type') {
            return value === TransactionAction.INCOME ? 'Income' : 'Expense'
        }
        if (key === 'categoryId') {
            return categoryCacheList.find(c => c.id === value)?.title || String(value)
        }
        if (key === 'financialAccountId') {
            return financialAccountCacheList.find(a => a.id === value)?.title || String(value)
        }
        if (key === 'date') {
            const dateFilter = value as DateFilter
            if (dateFilter.gte && dateFilter.lte) {
                return (
                    <div className='flex flex-row gap-1'>
                        {renderDate(dateFilter.gte)}
                        <DynamicIcon name='move-right' />
                        {renderDate(dateFilter.lte)}
                    </div>
                )
            }
            if (dateFilter.gte) return `From ${renderDate(dateFilter.gte)}`
            if (dateFilter.lte) return `To ${renderDate(dateFilter.lte)}`
        }
        return String(value)
    }

    const columns: ColumnDef<ITransaction>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={value => row.toggleSelected(!!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            id: 'title',
            accessorKey: 'title',
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.title.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <p>{row.getValue('title')}</p>
        },
        {
            id: 'date',
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button
                        className='text-white font-bold'
                        variant='ghost'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.date.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <p>{new Date(row.getValue('date')).toLocaleDateString('it-IT')}</p>
        },

        {
            id: 'amount',
            accessorFn: row => row.amounts[0]?.amount || 0,
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.amount.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const transaction = row.original
                const amount = transaction.amounts[0]?.amount || 0
                const isExpense = transaction.action === TransactionAction.EXPENSES
                return (
                    <p>
                        <span className={cn(isExpense ? 'danger' : 'success', 'font-bold')}>
                            {isExpense ? '-' : '+'}
                        </span>
                        &nbsp;
                        {Math.abs(amount)}
                    </p>
                )
            }
        },
        {
            id: 'category',
            accessorFn: row => categoryCacheList.find(c => c.id === row.categoryId)?.title || '',
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.category.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const transaction = row.original
                const category = categoryCacheList.find(c => c.id === transaction.categoryId)
                return <p>{category?.title || ''}</p>
            }
        },
        {
            id: 'subcategory',
            accessorFn: row => {
                const category = categoryCacheList.find(c => c.id === row.categoryId)
                return category?.subcategories.find(s => s.id === row.subcategoryId)?.title || ''
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.subcategory.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const transaction = row.original
                const category = categoryCacheList.find(c => c.id === transaction.categoryId)

                if (!category) return <p></p>

                const subcategory = category.subcategories.find(s => s.id === transaction.subcategoryId)

                return <p>{subcategory?.title || ''}</p>
            }
        },
        {
            id: 'account',
            accessorFn: row =>
                financialAccountCacheList.find(a => a.id === row.amounts[0]?.financialAccountId)?.title || '',
            header: ({ column }) => {
                return (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('form.account.label')}
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const transaction = row.original
                const account = financialAccountCacheList.find(a => a.id === transaction.amounts[0]?.financialAccountId)
                return <p>{account?.title || ''}</p>
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const transaction = row.original

                return (
                    <div onClick={e => e.stopPropagation()} className='w-fit'>
                        <OptionsPopover<ITransaction>
                            data={transaction}
                            openEdit={(item: ITransaction) => {
                                openModal('edit', item)
                            }}
                            openDelete={openDeleteModal}
                        />
                    </div>
                )
            }
        }
    ]

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('transactions.title')}
                    breadcrumbs={[{ label: t('dashboard.title'), href: '/' }, { label: t('transactions.title') }]}
                    fetchAction={{
                        onClick: () => {
                            if (viewMode === 'table') {
                                loadTransactionsPaginated(transactionFilterSetting)
                            } else {
                                fetchTransaction(filters, transactionFilterSetting)
                            }
                        },
                        loading:
                            transactionLoading.fetch || categoryLoading.fetchCategory || financialAccountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: transactionLoading.add
                    }}
                />

                <div className='flex flex-row justify-between'>
                    <div className='flex flex-row space-x-6 w-full'>
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
                                    onClick={() => removeFilter(key as keyof ITransactionFilters)}
                                >
                                    {getFilterLabel(key as keyof ITransactionFilters, value)}
                                    <X />
                                </Button>
                            ))}
                        </div>

                        <FilterButton<ITransactionFilters>
                            fields={filterFields}
                            filters={filters}
                            onFilterChange={handleFlatFilterChange}
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
                {transactionLoading.fetch && localTransactionList.length === 0 ? (
                    <div className='flex justify-center items-center w-full py-20'>
                        <p className='text-muted-foreground'>{t('messages.loading')}...</p>
                    </div>
                ) : localTransactionList.length > 0 ? (
                    viewMode === 'list' ? (
                        <>
                            {Object.entries(groupTransactionsByDate(localTransactionList))
                                .sort(([a], [b]) => b.localeCompare(a))
                                .map(([date, transactions]) => (
                                    <div key={date} className='flex flex-col space-y-2'>
                                        <h4>
                                            {(() => {
                                                const currentYear = new Date().getFullYear()
                                                const dateObj = new Date(date)
                                                const isCurrentYear = dateObj.getFullYear() === currentYear

                                                const options: Intl.DateTimeFormatOptions = isCurrentYear
                                                    ? { day: 'numeric', month: 'long' }
                                                    : { day: 'numeric', month: 'long', year: 'numeric' }

                                                return new Intl.DateTimeFormat('it-IT', options).format(dateObj)
                                            })()}
                                        </h4>
                                        <Box>
                                            <>
                                                {transactions.map(transaction => (
                                                    <TransactionItem
                                                        key={transaction.id}
                                                        transaction={transaction}
                                                        openEdit={(item: ITransaction) => {
                                                            openModal('edit', item)
                                                        }}
                                                        openDelete={openDeleteModal}
                                                    />
                                                ))}
                                            </>
                                        </Box>
                                    </div>
                                ))}
                            {isLoadingMore && (
                                <div className='flex flex-col flex-y-2 justify-center items-center w-full py-4'>
                                    <p className='text-muted-foreground'>{t('messages.loading')}...</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <DataTable
                            data={localTransactionList}
                            columns={columns}
                            manualPagination={true}
                            pageCount={Math.ceil(totalCount / (transactionFilterSetting.take || 20))}
                            onPaginationChange={handleTablePaginationChange}
                            manualSorting={true}
                            onSortingChange={handleTableSortingChange}
                            isLoading={transactionLoading.fetch}
                        />
                    )
                ) : (
                    <>
                        <div className='flex justify-center w-full pt-20'>
                            <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                                {Object.keys(filters).length > 0 ? (
                                    // Show "no results" when filters are active
                                    <div className='flex flex-col items-center space-y-8 justify-center'>
                                        <Search className='w-16 h-16 text-muted-foreground' />
                                        <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                                            <h4>{t('messages.noResults')}</h4>
                                            <p className='text-muted-foreground'>{t('messages.tryAdjustingFilters')}</p>
                                        </div>
                                        <Button variant='outline' onClick={() => handleFilterChange({})}>
                                            {t('messages.clearFilters')}
                                        </Button>
                                    </div>
                                ) : (
                                    // Show empty state when no filters are active
                                    <>
                                        <div className='flex flex-col items-center space-y-8 justify-center'>
                                            <ArrowLeftRight className='w-16 h-16' />
                                            <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                                                <h4>{t('transactions.empty.title')}</h4>
                                                <p className='text-muted-foreground'>
                                                    {t('transactions.empty.subtitle')}
                                                </p>
                                            </div>
                                        </div>
                                        {(financialAccountCacheList.length == 0 || categoryCacheList.length == 0) && (
                                            <>
                                                <Divider />
                                                <div className='flex flex-col items-center space-y-8 justify-center'>
                                                    <div className='flex flex-col items-center space-y-2 justify-center text-center'>
                                                        <p className='warning'>
                                                            {t('messages.noCategoriesAndAccountTitle')}
                                                        </p>
                                                        <p className='warning'>
                                                            {t('messages.noCategoriesAndAccountSub')}
                                                        </p>
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
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <TransactionDialog></TransactionDialog>

            {/* {dialogUploadOpen && (
                <ImportDialog open={true} inEditingMode={true} closeDialog={() => setItemToEdit(null)} />
            )} */}
        </>
    )
}
