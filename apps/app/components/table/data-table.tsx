import { useState } from 'react'
import * as React from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type VisibilityState
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@poveroh/ui/components/table'
import { useTranslations } from 'next-intl'
import { cn } from '@poveroh/ui/lib/utils'

type TableProps<T> = {
    data: T[]
    columns: ColumnDef<T>[]
    manualPagination?: boolean
    pageCount?: number
    onPaginationChange?: (pagination: PaginationState) => void
    manualSorting?: boolean
    onSortingChange?: (sorting: SortingState) => void
    isLoading?: boolean
}

export function DataTable<T>({
    data,
    columns,
    manualPagination = false,
    pageCount: controlledPageCount,
    onPaginationChange: onPaginationChangeCallback,
    manualSorting = false,
    onSortingChange: onSortingChangeCallback,
    isLoading = false
}: TableProps<T>) {
    const t = useTranslations()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20
    })

    const handlePaginationChange = (updater: ((old: PaginationState) => PaginationState) | PaginationState) => {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater
        setPagination(newPagination)
        if (manualPagination && onPaginationChangeCallback) {
            onPaginationChangeCallback(newPagination)
        }
    }

    const handleSortingChange = (updater: ((old: SortingState) => SortingState) | SortingState) => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater
        setSorting(newSorting)

        // Reset to first page when sorting changes in manual mode
        if (manualSorting && manualPagination) {
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }

        if (manualSorting && onSortingChangeCallback) {
            onSortingChangeCallback(newSorting)
        }
    }

    const table = useReactTable({
        data,
        columns,
        pageCount: controlledPageCount ?? -1,
        manualPagination,
        manualSorting,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: handlePaginationChange,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        }
    })

    return (
        <div className='w-full'>
            <div className='overflow-hidden rounded-md border border-border relative'>
                {isLoading && (
                    <div className='absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center'>
                        <div className='flex items-center space-x-3 bg-card px-4 py-3 rounded-lg border border-border shadow-lg'>
                            <Loader2 className='animate-spin' />
                            <p>{t('messages.loading')}</p>
                        </div>
                    </div>
                )}
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} className={cn(cell.column.id == 'select' && 'px-2')}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    {t('messages.noResult')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-between space-x-2 py-4'>
                <p className='sub'>
                    {t('layout.table.selectedRows', {
                        a: table.getFilteredSelectedRowModel().rows.length,
                        b: table.getFilteredRowModel().rows.length
                    })}
                </p>
                <div className='flex flex-row items-center space-x-10 w-fit'>
                    <div className='flex flex-row items-center space-x-2'>
                        <p className='text-nowrap'>{t('layout.table.rowsPerPage')}</p>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={value => {
                                table.setPageSize(Number(value))
                            }}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <SelectItem key={pageSize} value={pageSize.toString()}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <p>
                        {t('layout.table.pageOf', {
                            a: table.getState().pagination.pageIndex + 1,
                            b: table.getPageCount().toLocaleString()
                        })}
                    </p>
                    <div className='flex flex-row space-x-1'>
                        <Button
                            variant='secondary'
                            onClick={() => table.firstPage()}
                            disabled={!table.getCanPreviousPage() || isLoading}
                        >
                            <ChevronsLeft />
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || isLoading}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || isLoading}
                        >
                            <ChevronRight />
                        </Button>
                        <Button
                            variant='secondary'
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage() || isLoading}
                        >
                            <ChevronsRight />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
