'use client'

import { useCallback, useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery, keepPreviousData } from '@tanstack/react-query'
import { type SortingState } from '@tanstack/react-table'
import { getTransactions } from '@/api/sdk.gen'
import { getTransactionsQueryKey } from '@/api/@tanstack/react-query.gen'
import { TransactionData, TransactionFilters, TransactionListData } from '@poveroh/types'
import { FilterOptions } from '@/api/types.gen'
import { ViewModeType } from '@/types'
import { storage } from '@/lib/storage'

const PAGE_SIZE = 20

type UseTransactionPaginationProps = {
    activeFilters: TransactionFilters
}

export const useTransactionPagination = ({ activeFilters }: UseTransactionPaginationProps) => {
    const [viewMode, setViewMode] = useState<ViewModeType>(() => {
        const saved = storage.get('transactionViewMode')
        return (saved as ViewModeType) || 'list'
    })

    const [tableSorting, setTableSorting] = useState<SortingState>([])
    const [tablePagination, setTablePagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })

    const buildSortOptions = (sorting?: SortingState): Pick<FilterOptions, 'sortBy' | 'sortOrder'> => {
        if (!sorting || sorting.length === 0 || !sorting[0]) return {}
        return {
            sortBy: sorting[0].id,
            sortOrder: sorting[0].desc ? 'desc' : 'asc'
        }
    }

    // List view: infinite query
    const infiniteQuery = useInfiniteQuery({
        queryKey: [...getTransactionsQueryKey(), 'infinite', activeFilters] as const,
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await getTransactions({
                query: {
                    filter: activeFilters,
                    options: { skip: pageParam, take: PAGE_SIZE }
                },
                throwOnError: true
            })
            return data
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + (page?.data?.data?.length ?? 0), 0)
            const total = (lastPage?.data as TransactionListData)?.total ?? 0
            return loaded < total ? loaded : undefined
        },
        enabled: viewMode === 'list'
    })

    // Table view: paginated query
    const tableQuery = useQuery({
        queryKey: [
            ...getTransactionsQueryKey(),
            'table',
            activeFilters,
            tablePagination.pageIndex,
            tablePagination.pageSize,
            tableSorting
        ] as const,
        queryFn: async () => {
            const { data } = await getTransactions({
                query: {
                    filter: activeFilters,
                    options: {
                        skip: tablePagination.pageIndex * tablePagination.pageSize,
                        take: tablePagination.pageSize,
                        ...buildSortOptions(tableSorting)
                    }
                },
                throwOnError: true
            })
            return data
        },
        placeholderData: keepPreviousData,
        enabled: viewMode === 'table'
    })

    // Derive transactions and total from the active query
    const transactions: TransactionData[] = useMemo(() => {
        if (viewMode === 'list') {
            return infiniteQuery.data?.pages.flatMap(page => page?.data?.data ?? []) ?? []
        }
        return tableQuery.data?.data?.data ?? []
    }, [viewMode, infiniteQuery.data, tableQuery.data])

    const totalCount = useMemo(() => {
        if (viewMode === 'list') {
            const lastPage = infiniteQuery.data?.pages[infiniteQuery.data.pages.length - 1]
            return (lastPage?.data as TransactionListData)?.total ?? 0
        }
        return (tableQuery.data?.data as TransactionListData)?.total ?? 0
    }, [viewMode, infiniteQuery.data, tableQuery.data])

    const isLoading = viewMode === 'list' ? infiniteQuery.isLoading : tableQuery.isLoading
    const isLoadingMore = infiniteQuery.isFetchingNextPage

    // Infinite scroll binding
    const bindInfiniteScroll = useCallback(
        (ref: React.RefObject<HTMLDivElement | null>) => {
            if (viewMode !== 'list') return

            let scrollContainer: HTMLElement | Window = ref.current?.closest('.overflow-y-auto') as HTMLElement
            if (!scrollContainer) scrollContainer = window

            const handleScroll = () => {
                if (!infiniteQuery.hasNextPage || infiniteQuery.isFetchingNextPage) return

                let scrollTop: number
                let scrollHeight: number
                let clientHeight: number

                if (scrollContainer instanceof Window) {
                    scrollTop = window.scrollY || document.documentElement.scrollTop
                    scrollHeight = document.documentElement.scrollHeight
                    clientHeight = window.innerHeight
                } else {
                    scrollTop = scrollContainer.scrollTop
                    scrollHeight = scrollContainer.scrollHeight
                    clientHeight = scrollContainer.clientHeight
                }

                if (scrollTop + clientHeight >= scrollHeight - 100) {
                    infiniteQuery.fetchNextPage()
                }
            }

            scrollContainer.addEventListener('scroll', handleScroll)
            return () => scrollContainer.removeEventListener('scroll', handleScroll)
        },
        [viewMode, infiniteQuery.hasNextPage, infiniteQuery.isFetchingNextPage, infiniteQuery.fetchNextPage]
    )

    const handleViewModeChange = (newMode: ViewModeType) => {
        setViewMode(newMode)
        storage.set('transactionViewMode', newMode)
    }

    const handleTablePaginationChange = (pagination: { pageIndex: number; pageSize: number }) => {
        setTablePagination(pagination)
    }

    const handleTableSortingChange = (newSorting: SortingState) => {
        setTableSorting(newSorting)
        setTablePagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const refetch = () => {
        if (viewMode === 'list') {
            infiniteQuery.refetch()
        } else {
            tableQuery.refetch()
        }
    }

    return {
        viewMode,
        transactions,
        totalCount,
        isLoading,
        isLoadingMore,
        tableSorting,
        pageSize: PAGE_SIZE,
        handleViewModeChange,
        refetch,
        bindInfiniteScroll,
        handleTablePaginationChange,
        handleTableSortingChange
    }
}
