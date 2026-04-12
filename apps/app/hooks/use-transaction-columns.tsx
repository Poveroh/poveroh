'use client'

import { useTranslations } from 'next-intl'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { ArrowUpDown } from 'lucide-react'
import { CategoryBadge } from '@/components/item/category-badge'
import DynamicIcon from '@/components/icon/dynamic-icon'
import { OptionsPopover } from '@/components/navbar/options-popover'
import { useCategory } from './use-category'
import { useFinancialAccount } from './use-account'
import { useConfig } from './use-config'
import { TransactionData } from '@poveroh/types'
import { cn } from '@poveroh/ui/lib/utils'

type UseTransactionColumnsProps = {
    openEdit: (item: TransactionData) => void
    openDelete: (item: TransactionData) => void
}

export const useTransactionColumns = ({
    openEdit,
    openDelete
}: UseTransactionColumnsProps): ColumnDef<TransactionData>[] => {
    const t = useTranslations()
    const { categoryData } = useCategory()
    const { accountQuery } = useFinancialAccount()
    const { renderDate } = useConfig()

    return [
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
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='text-white font-bold'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.title.label')}
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <p>{row.getValue('title')}</p>
        },
        {
            id: 'date',
            accessorKey: 'date',
            header: ({ column }) => (
                <Button
                    className='text-white font-bold'
                    variant='ghost'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.date.label')}
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => <p>{renderDate(row.getValue('date'))}</p>
        },
        {
            id: 'amount',
            accessorFn: row => row.amounts[0]?.amount || 0,
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='text-white font-bold'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.amount.label')}
                    <ArrowUpDown />
                </Button>
            ),
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
            accessorFn: row => categoryData.find(c => c.id === row.categoryId)?.title || '',
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='text-white font-bold'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.category.label')}
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                const category = categoryData.find(c => c.id === row.original.categoryId)
                if (!category) return <p></p>
                return <CategoryBadge category={category} compact />
            }
        },
        {
            id: 'subcategory',
            accessorFn: row => {
                const category = categoryData.find(c => c.id === row.categoryId)
                return category?.subcategories?.find(s => s.id === row.subcategoryId)?.title || ''
            },
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='text-white font-bold'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.subcategory.label')}
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                const transaction = row.original
                const category = categoryData.find(c => c.id === transaction.categoryId)
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
                    accountQuery.data?.data.find(a => a.id === row.amounts[0]?.financialAccountId)?.title || ''
                if (row.action === 'TRANSFER' && row.amounts[1]) {
                    const secondAccount =
                        accountQuery.data?.data.find(a => a.id === row.amounts[1]?.financialAccountId)?.title || ''
                    return `${firstAccount} → ${secondAccount}`
                }
                return firstAccount
            },
            header: ({ column }) => (
                <Button
                    variant='ghost'
                    className='text-white font-bold'
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    {t('form.account.label')}
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => {
                const transaction = row.original
                const firstAccount = accountQuery.data?.data.find(
                    a => a.id === transaction.amounts[0]?.financialAccountId
                )

                if (transaction.action === 'TRANSFER' && transaction.amounts[1]) {
                    const secondAccount = accountQuery.data?.data.find(
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
                        <OptionsPopover<TransactionData>
                            data={transaction}
                            buttons={[
                                {
                                    onClick: item => openEdit(item),
                                    label: t('buttons.editItem'),
                                    icon: 'pencil'
                                },
                                {
                                    onClick: item => openDelete(item),
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
}
