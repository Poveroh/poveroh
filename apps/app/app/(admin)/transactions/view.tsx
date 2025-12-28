'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { Input } from '@poveroh/ui/components/input'

import { ArrowLeftRight, ArrowUpDown, List, Plus, Search, Table } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'

import { useTransaction } from '@/hooks/use-transaction'
import { useCategory } from '@/hooks/use-category'
import { useFinancialAccount } from '@/hooks/use-account'

import { IFilterOptions, ITransaction, TransactionAction } from '@poveroh/types'

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

type ViewModeType = 'list' | 'table'

export default function TransactionsView() {
    const t = useTranslations()
    const {
        transactionCacheList,
        fetchTransaction,
        fetchTransactionPaginated,
        groupTransactionsByDate,
        transactionLoading
    } = useTransaction()
    const { categoryCacheList, fetchCategory, categoryLoading } = useCategory()
    const { financialAccountCacheList, fetchFinancialAccount, financialAccountLoading } = useFinancialAccount()

    const { openModal } = useModal<ITransaction>()
    const { openModal: openDeleteModal } = useDeleteModal<ITransaction>()

    const [localTransactionList, setLocalTransactionList] = useState<ITransaction[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)

    const [viewMode, setViewMode] = useState<ViewModeType>('list')

    const [transactionFilterSetting, setTransactionFilterSetting] = useState<IFilterOptions>({
        skip: 0,
        take: 20
    })

    useEffect(() => {
        fetchCategory()
        fetchFinancialAccount()

        // Load initial data based on view mode
        if (viewMode === 'table') {
            loadTransactionsPaginated(transactionFilterSetting)
        } else {
            fetchTransaction({}, transactionFilterSetting)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setLocalTransactionList(transactionCacheList)
    }, [transactionCacheList])

    // Handle view mode change and reload data accordingly
    const handleViewModeChange = async (newMode: ViewModeType) => {
        setViewMode(newMode)

        if (newMode === 'table') {
            await loadTransactionsPaginated(transactionFilterSetting)
        } else {
            // Reset to initial state for list view
            const initialOptions = { skip: 0, take: 20 }
            setTransactionFilterSetting(initialOptions)
            await fetchTransaction({}, initialOptions)
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
    }, [isLoadingMore, viewMode])

    const loadTransactionsPaginated = async (options: IFilterOptions) => {
        const result = await fetchTransactionPaginated({}, options)
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

        await fetchTransaction({}, newOptions, true, true)

        setTransactionFilterSetting(newOptions)
        setIsLoadingMore(false)
    }

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (isEmpty(textToSearch)) {
            setLocalTransactionList(transactionCacheList)
            return
        }

        const filteredList = transactionCacheList.filter(x => x.title.toLowerCase().includes(textToSearch))

        setLocalTransactionList(filteredList)
    }

    const handleTablePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
        const newOptions = {
            skip: pagination.pageIndex * pagination.pageSize,
            take: pagination.pageSize
        }
        setTransactionFilterSetting(newOptions)
        loadTransactionsPaginated(newOptions)
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
            accessorFn: row => row.amounts[0]?.amount || 0,
            id: 'amount',
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
            accessorFn: row => categoryCacheList.find(c => c.id === row.categoryId)?.title || '',
            id: 'category',
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
            accessorFn: row => {
                const category = categoryCacheList.find(c => c.id === row.categoryId)
                return category?.subcategories.find(s => s.id === row.subcategoryId)?.title || ''
            },
            id: 'subcategory',
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
            accessorFn: row =>
                financialAccountCacheList.find(a => a.id === row.amounts[0]?.financialAccountId)?.title || '',
            id: 'account',
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
                                fetchTransaction({}, transactionFilterSetting)
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
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-1/3'
                        onChange={onSearch}
                    />
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
                {localTransactionList.length > 0 ? (
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
                        />
                    )
                ) : (
                    <>
                        <div className='flex justify-center w-full pt-20'>
                            <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                                <div className='flex flex-col items-center space-y-8 justify-center'>
                                    <ArrowLeftRight />
                                    <div className='flex flex-col items-center space-y-2 justify-center'>
                                        <h4>{t('transactions.empty.title')}</h4>
                                        <p>{t('transactions.empty.subtitle')}</p>
                                    </div>
                                </div>
                                {(financialAccountCacheList.length == 0 || categoryCacheList.length == 0) && (
                                    <>
                                        <Divider />
                                        <div className='flex flex-col items-center space-y-8 justify-center'>
                                            <div className='flex flex-col items-center space-y-2 justify-center'>
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
