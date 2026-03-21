'use client'

import { useEffect, useRef, useState } from 'react'
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
import { CategoryBadge } from '@/components/item/category-badge'
import { FilterButton } from '@/components/filter/filter-button'

import { useTransaction } from '@/hooks/use-transaction'
import { useCategory } from '@/hooks/use-category'
import { useFinancialAccount } from '@/hooks/use-account'

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
import moment from 'moment-timezone'
import {
    DateFilter,
    FilterOptions,
    Transaction,
    TransactionActionEnum,
    TransactionData,
    TransactionFilters
} from '@/api/types.gen'

//TODO: this file is getting quite big, consider splitting it into smaller components (for example the table view and the list view could be separate components, and the filter logic could also be extracted to a separate hook or component)
//TODO: after update, review types and logics

type FilterField =
    | {
          name: string
          label: string
          type: 'select'
          options: Array<{ label: string; value: string }>
      }
    | {
          name: string
          label: string
          type: 'text' | 'number' | 'date'
      }
    | {
          fromName: string
          toName: string
          label: string
          type: 'dateRange'
      }

type FlatTransactionFilters = {
    type?: TransactionActionEnum
    categoryId?: string
    subcategoryId?: string
    financialAccountId?: string
    fromDate?: string
    toDate?: string
}

const isDateFilter = (value: unknown): value is DateFilter => {
    if (typeof value !== 'object' || value === null) {
        return false
    }

    return 'gte' in value || 'lte' in value
}

export default function TransactionsView() {
    const t = useTranslations()
    const router = useRouter()
    const searchParams = useSearchParams()
    const mainDivRef = useRef<HTMLDivElement | null>(null)

    const {
        transactionCacheList,
        fetchTransaction,
        fetchTransactionPaginated,
        groupTransactionsByDate,
        transactionLoading
    } = useTransaction()
    const { categoryCacheList, fetchCategories, categoryLoading } = useCategory()
    const { financialAccountCacheList, fetchFinancialAccounts, financialAccountLoading } = useFinancialAccount()
    const { renderDate, preferedLanguage } = useConfig()

    const { openModal } = useModal<TransactionData>('transaction')
    const { openModal: openDeleteModal } = useDeleteModal<TransactionData>()

    const [localTransactionList, setLocalTransactionList] = useState<Transaction[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([])

    const [viewMode, setViewMode] = useState<ViewModeType>(() => {
        const saved = storage.get('transactionViewMode')
        return (saved as ViewModeType) || 'list'
    })

    const [transactionFilterSetting, setTransactionFilterSetting] = useState<FilterOptions>({
        skip: 0,
        take: 20
    })

    // Initialize filters from URL parameters
    const [filters, setFilters] = useState<TransactionFilters>(() => {
        const params: TransactionFilters = {}
        const categoryId = searchParams.get('categoryId')
        const subcategoryId = searchParams.get('subcategoryId')
        const financialAccountId = searchParams.get('financialAccountId')
        const type = searchParams.get('type')
        const fromDate = searchParams.get('fromDate')
        const toDate = searchParams.get('toDate')

        if (categoryId) params.categoryId = categoryId
        if (subcategoryId) params.subcategoryId = subcategoryId
        if (financialAccountId) params.financialAccountId = financialAccountId
        if (type) params.type = type as TransactionActionEnum
        if (fromDate || toDate) {
            //TODO: understand why this parsing is needed and if it can be simplified, maybe by changing the backend to accept date strings in the correct format directly
            // params.date = {}
            // if (fromDate) params.date.gte = fromDate
            // if (toDate) params.date.lte = toDate
        }

        return params
    })

    useEffect(() => {
        fetchCategories()
        fetchFinancialAccounts()

        if (viewMode === 'table') {
            loadTransactionsPaginated(transactionFilterSetting)
        } else {
            fetchTransaction(filters, transactionFilterSetting)
        }
    }, [])

    useEffect(() => {
        setLocalTransactionList(transactionCacheList)
    }, [transactionCacheList])

    const handleViewModeChange = async (newMode: ViewModeType) => {
        setViewMode(newMode)
        storage.set('transactionViewMode', newMode)

        if (newMode === 'table') {
            await loadTransactionsPaginated(transactionFilterSetting)
        } else {
            const initialOptions = { skip: 0, take: 20 }
            setTransactionFilterSetting(initialOptions)
            await fetchTransaction(filters, initialOptions)
        }
    }

    // Infinite scroll: automatically load more transactions when you reach the bottom
    useEffect(() => {
        let scrollContainer: HTMLElement | Window = mainDivRef.current?.closest('.overflow-y-auto') as HTMLElement

        if (!scrollContainer) {
            scrollContainer = window
        }

        const handleScroll = () => {
            if (isLoadingMore || transactionLoading.fetch || viewMode === 'table') {
                return
            }

            let scrollTop: number
            let scrollHeight: number
            let clientHeight: number

            if (scrollContainer instanceof Window) {
                scrollTop = window.scrollY || document.documentElement.scrollTop
                scrollHeight = document.documentElement.scrollHeight
                clientHeight = window.innerHeight
            } else {
                scrollTop = (scrollContainer as HTMLElement).scrollTop
                scrollHeight = (scrollContainer as HTMLElement).scrollHeight
                clientHeight = (scrollContainer as HTMLElement).clientHeight
            }

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMore()
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [isLoadingMore, viewMode, filters, transactionFilterSetting])

    const updateURLParams = (newFilters: TransactionFilters) => {
        const params = new URLSearchParams()

        if (typeof newFilters.categoryId === 'string') params.set('categoryId', newFilters.categoryId)
        if (typeof newFilters.subcategoryId === 'string') params.set('subcategoryId', newFilters.subcategoryId)
        if (typeof newFilters.financialAccountId === 'string') {
            params.set('financialAccountId', newFilters.financialAccountId)
        }
        if (typeof newFilters.type === 'string') params.set('type', newFilters.type)

        const dateFilter = newFilters.date
        if (isDateFilter(dateFilter)) {
            if (dateFilter.gte) params.set('fromDate', dateFilter.gte)
            if (dateFilter.lte) params.set('toDate', dateFilter.lte)
        }

        const queryString = params.toString()
        const newPath = queryString ? `/transactions?${queryString}` : '/transactions'
        router.replace(newPath, { scroll: false })
    }

    const handleFilterChange = (newFilters: TransactionFilters) => {
        setFilters(newFilters)
        updateURLParams(newFilters)

        // Reset to first page and reload data
        const newOptions = { skip: 0, take: 20 }
        setTransactionFilterSetting(newOptions)

        if (viewMode === 'table') {
            loadTransactionsPaginated(newOptions, newFilters)
        } else {
            fetchTransaction(newFilters, newOptions, false, true)
        }
    }

    const loadTransactionsPaginated = async (options: FilterOptions, filtersToUse?: TransactionFilters) => {
        const activeFilters = filtersToUse !== undefined ? filtersToUse : filters

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
            if (isEmpty(textToSearch)) {
                setLocalTransactionList(transactionCacheList)
                return
            }

            const filteredList = transactionCacheList.filter(x =>
                x.title.toLowerCase().includes(textToSearch.toLowerCase())
            )
            setLocalTransactionList(filteredList)
        }
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
                { label: 'Income', value: 'INCOME' },
                { label: 'Expense', value: 'EXPENSES' },
                { label: 'Transfer', value: 'TRANSFER' }
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

    const handleFlatFilterChange = (newFlatFilters: FlatTransactionFilters) => {
        const newFilters: TransactionFilters = {}

        if (newFlatFilters.type) {
            newFilters.type = newFlatFilters.type as TransactionActionEnum
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

    const removeFilter = (key: keyof TransactionFilters) => {
        const newFilters: TransactionFilters = { ...filters }

        if (key === 'date') {
            delete newFilters.date
        } else {
            delete newFilters[key]
        }

        handleFilterChange(newFilters)
    }

    const getFilterLabel = (key: keyof TransactionFilters, value: TransactionFilters[keyof TransactionFilters]) => {
        if (key === 'type') {
            if (value === 'INCOME') return 'Income'
            if (value === 'EXPENSES') return 'Expense'
            if (value === 'TRANSFER') return 'Transfer'
        }
        if (key === 'categoryId') {
            return categoryCacheList.find(c => c.id === value)?.title || String(value)
        }
        if (key === 'financialAccountId') {
            return financialAccountCacheList.find(a => a.id === value)?.title || String(value)
        }
        if (key === 'date') {
            if (!isDateFilter(value)) {
                return String(value)
            }

            if (value.gte && value.lte) {
                return (
                    <div className='flex flex-row gap-1'>
                        {renderDate(value.gte)}
                        <DynamicIcon name='move-right' />
                        {renderDate(value.lte)}
                    </div>
                )
            }
            if (value.gte) return `From ${renderDate(value.gte)}`
            if (value.lte) return `To ${renderDate(value.lte)}`
        }
        return String(value)
    }

    const columns: ColumnDef<Transaction>[] = [
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
            cell: ({ row }) => <p>{renderDate(row.getValue('date'))}</p>
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
                const isExpense = transaction.action === 'EXPENSES'
                const isTransfer = transaction.action === 'TRANSFER'

                return (
                    <p>
                        {!isTransfer && (
                            <span className={cn(isExpense ? 'danger' : 'success', 'font-bold')}>
                                {isExpense ? '-' : '+'}
                            </span>
                        )}
                        {!isTransfer && '\u00A0'}
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

                if (!category) return <p></p>

                return <CategoryBadge category={category} compact />
            }
        },
        {
            id: 'subcategory',
            accessorFn: row => {
                const category = categoryCacheList.find(c => c.id === row.categoryId)
                return category?.subcategories?.find(s => s.id === row.subcategoryId)?.title || ''
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

                const subcategory = category.subcategories?.find(s => s.id === transaction.subcategoryId)

                if (!subcategory) return <p></p>

                return (
                    <CategoryBadge
                        variant='subcategory'
                        subcategory={subcategory}
                        color={category.color}
                        compact
                        showConnector={false}
                    />
                )
            }
        },
        {
            id: 'account',
            accessorFn: row => {
                const firstAccount =
                    financialAccountCacheList.find(a => a.id === row.amounts[0]?.financialAccountId)?.title || ''
                if (row.action === 'TRANSFER' && row.amounts[1]) {
                    const secondAccount =
                        financialAccountCacheList.find(a => a.id === row.amounts[1]?.financialAccountId)?.title || ''
                    return `${firstAccount} → ${secondAccount}`
                }
                return firstAccount
            },
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
                const firstAccount = financialAccountCacheList.find(
                    a => a.id === transaction.amounts[0]?.financialAccountId
                )

                if (transaction.action === 'TRANSFER' && transaction.amounts[1]) {
                    const secondAccount = financialAccountCacheList.find(
                        a => a.id === transaction.amounts[1]?.financialAccountId
                    )
                    return (
                        <div className='flex flex-row items-center gap-1'>
                            <p>{firstAccount?.title || ''}</p>
                            <DynamicIcon name='move-right' className='h-4 w-4' />
                            <p>{secondAccount?.title || ''}</p>
                        </div>
                    )
                }
                return <p>{firstAccount?.title || ''}</p>
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const transaction = row.original

                return (
                    <div onClick={e => e.stopPropagation()} className='w-fit'>
                        <OptionsPopover<Transaction>
                            data={transaction}
                            buttons={[
                                {
                                    onClick: item => {
                                        openModal('edit', item)
                                    },
                                    label: t('buttons.editItem'),
                                    icon: 'pencil'
                                },
                                {
                                    onClick: item => openDeleteModal(item),
                                    variant: 'danger',
                                    label: t('buttons.deleteItem'),
                                    icon: 'trash-2'
                                }
                            ]}
                        />
                    </div>
                )
            }
        }
    ]

    return (
        <>
            <div ref={mainDivRef} className='space-y-12 w-full'>
                <Header
                    title={t('transactions.title')}
                    breadcrumbs={[{ label: t('dashboard.title'), href: '/' }, { label: t('transactions.title') }]}
                    fetchAction={{
                        onClick: () => {
                            if (viewMode === 'table') {
                                loadTransactionsPaginated(transactionFilterSetting)
                            } else {
                                fetchTransaction(filters, transactionFilterSetting, false, true)
                            }
                        },
                        loading:
                            transactionLoading.fetch || categoryLoading.fetchCategories || financialAccountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: transactionLoading.create
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
                                    onClick={() => removeFilter(key as keyof TransactionFilters)}
                                >
                                    {getFilterLabel(key as keyof TransactionFilters, value)}
                                    <X />
                                </Button>
                            ))}
                        </div>

                        <FilterButton<FlatTransactionFilters>
                            fields={filterFields}
                            filters={{
                                type:
                                    typeof filters.type === 'string'
                                        ? (filters.type as TransactionActionEnum)
                                        : undefined,
                                categoryId:
                                    typeof filters.categoryId === 'string' ? (filters.categoryId as string) : undefined,
                                subcategoryId:
                                    typeof filters.subcategoryId === 'string'
                                        ? (filters.subcategoryId as string)
                                        : undefined,
                                financialAccountId:
                                    typeof filters.financialAccountId === 'string'
                                        ? (filters.financialAccountId as string)
                                        : undefined,
                                fromDate: isDateFilter(filters.date) ? filters.date.gte : undefined,
                                toDate: isDateFilter(filters.date) ? filters.date.lte : undefined
                            }}
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
                                .map(([date, transactions]) => {
                                    const dailyTotal = transactions.reduce((sum, transaction) => {
                                        const amount = Number(transaction.amounts[0]?.amount || 0)
                                        if (transaction.action === 'EXPENSES') {
                                            return sum - amount
                                        } else if (transaction.action === 'INCOME') {
                                            return sum + amount
                                        }
                                        return sum
                                    }, 0)

                                    return (
                                        <div key={date} className='flex flex-col space-y-2'>
                                            <div className='flex flex-row justify-between'>
                                                <h4>
                                                    {(() => {
                                                        const currentYear = moment().year()
                                                        const dateMoment = moment(date)
                                                        const isCurrentYear = dateMoment.year() === currentYear

                                                        return (
                                                            isCurrentYear
                                                                ? dateMoment.format('D MMMM')
                                                                : dateMoment.format('D MMMM YYYY')
                                                        ).toLocaleLowerCase(preferedLanguage)
                                                    })()}
                                                </h4>
                                                <p>
                                                    {dailyTotal !== 0 && <span>{dailyTotal > 0 ? '+' : ''}</span>}
                                                    {dailyTotal.toFixed(2)}
                                                </p>
                                            </div>
                                            <Box>
                                                <>
                                                    {transactions.map(transaction => (
                                                        <TransactionItem
                                                            key={transaction.id}
                                                            transaction={transaction}
                                                            openEdit={(item: TransactionData) => {
                                                                openModal('edit', item)
                                                            }}
                                                            openDelete={openDeleteModal}
                                                        />
                                                    ))}
                                                </>
                                            </Box>
                                        </div>
                                    )
                                })}
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
        </>
    )
}
