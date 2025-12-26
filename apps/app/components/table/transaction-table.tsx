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
    type SortingState,
    type VisibilityState
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '@poveroh/ui/components/dropdown-menu'
import { Input } from '@poveroh/ui/components/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@poveroh/ui/components/table'
import { ICategory, IFinancialAccount, ITransaction } from '@poveroh/types'

interface TransactionTableProps {
    transactions: ITransaction[]
    categories: ICategory[]
    accounts: IFinancialAccount[]
    onEdit: (transaction: ITransaction) => void
    onDelete: (transaction: ITransaction) => void
}

export function TransactionTable({ transactions, categories, accounts, onEdit, onDelete }: TransactionTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

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
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Data
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{new Date(row.getValue('date')).toLocaleDateString('it-IT')}</div>
        },
        {
            accessorKey: 'title',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Titolo
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue('title')}</div>
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Importo
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const transaction = row.original
                const amount = transaction.amounts[0]?.amount || 0
                return <div className='text-right font-medium'>{amount}</div>
            }
        },
        {
            accessorKey: 'category',
            header: 'Categoria',
            cell: ({ row }) => {
                const transaction = row.original
                const category = categories.find(c => c.id === transaction.categoryId)
                return <div>{category?.title || ''}</div>
            }
        },
        {
            accessorKey: 'account',
            header: 'Account',
            cell: ({ row }) => {
                const transaction = row.original
                const account = accounts.find(a => a.id === transaction.amounts[0]?.financialAccountId)
                return <div>{account?.title || ''}</div>
            }
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const transaction = row.original

                return (
                    <div className='flex space-x-2'>
                        <Button size='sm' variant='outline' onClick={() => onEdit(transaction)}>
                            Modifica
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => onDelete(transaction)}>
                            Elimina
                        </Button>
                    </div>
                )
            }
        }
    ]

    const table = useReactTable({
        data: transactions,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        }
    })

    return (
        <div className='w-full'>
            <div className='overflow-hidden rounded-md border border-border'>
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
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    Nessun risultato.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div className='text-muted-foreground flex-1 text-sm'>
                    {table.getFilteredSelectedRowModel().rows.length} di {table.getFilteredRowModel().rows.length} righe
                    selezionate.
                </div>
                <div className='space-x-2'>
                    <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Precedentefgsd
                    </Button>
                    <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Successivo
                    </Button>
                </div>
            </div>
        </div>
    )
}
