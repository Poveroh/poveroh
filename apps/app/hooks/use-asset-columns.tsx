'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Badge } from '@poveroh/ui/components/badge'
import { Button } from '@poveroh/ui/components/button'
import { LanguageLocaleMap, type AssetData, type AssetGroupLayout } from '@poveroh/types'

import { AssetAvatar } from '@/components/investments/asset-avatar'
import { OptionsPopover } from '@/components/navbar/options-popover'
import { useUser } from '@/hooks/use-user'
import { useFinancialAccount } from './use-account'
import { useUtils } from './use-utils'

type UseAssetColumnsProps = {
    portfolioTotal: number
    isEditable: (asset: AssetData) => boolean
    openEdit: (asset: AssetData) => void
    openDelete: (asset: AssetData) => void
}

/**
 * Builds the DataTable columns for an asset group, returning a factory keyed by the group layout (quoted holdings vs physical goods).
 * @param props The portfolio total and the callbacks used to resolve accounts and edit/delete rows.
 * @returns A function that, given a layout, returns the column definitions for that layout.
 */
export const useAssetColumns = ({
    portfolioTotal,
    isEditable,
    openEdit,
    openDelete
}: UseAssetColumnsProps): ((layout: AssetGroupLayout) => ColumnDef<AssetData>[]) => {
    const t = useTranslations()
    const { accountQuery } = useFinancialAccount()
    const { preferences } = useUser()
    const { renderDate, renderPriceLabel, renderDecimalLabel } = useUtils()

    return useCallback(
        (layout: AssetGroupLayout): ColumnDef<AssetData>[] => {
            const subtitleFor = (asset: AssetData): string => {
                if (asset.marketable) return asset.marketable.symbol ?? asset.marketable.isin ?? ''
                if (asset.vehicle) return asset.vehicle.plateNumber
                if (asset.realEstate) return asset.realEstate.address
                return ''
            }

            const groupKeyFor = (asset: AssetData): string | undefined => asset.marketable?.symbol ?? undefined

            const priceFor = (asset: AssetData): number => {
                const quantity = asset.quantity || 0
                const total = asset.currentValue || 0
                return quantity ? total / quantity : 0
            }

            const weightFor = (asset: AssetData): number => {
                const total = asset.currentValue || 0
                return portfolioTotal ? (total / portfolioTotal) * 100 : 0
            }

            const buyDateFor = (asset: AssetData): string | null =>
                asset.vehicle?.purchaseDate ?? asset.realEstate?.purchaseDate ?? null

            const nameColumn: ColumnDef<AssetData> = {
                id: 'name',
                accessorFn: row => row.title,
                header: ({ column }) => (
                    <Button
                        variant='ghost'
                        className='text-white font-bold'
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        {t('investments.assets.table.name')}
                        <ArrowUpDown />
                    </Button>
                ),
                cell: ({ row, table }) => {
                    const asset = row.original
                    const subtitle = subtitleFor(asset)

                    const rows = table.getRowModel().rows
                    const position = rows.findIndex(current => current.id === row.id)
                    const previous = position > 0 ? rows[position - 1]?.original : undefined
                    const groupKey = groupKeyFor(asset)
                    const isContinuation =
                        groupKey !== undefined && previous !== undefined && groupKeyFor(previous) === groupKey

                    return (
                        <div className='flex flex-row items-center space-x-3'>
                            {isContinuation ? (
                                <div className='w-9 h-9 shrink-0' />
                            ) : (
                                <AssetAvatar logo={asset.vehicle?.logoIcon} name={asset.title} />
                            )}
                            <div className='flex flex-col'>
                                <span className='font-medium'>{asset.title}</span>
                                {subtitle && <span className='sub text-xs'>{subtitle}</span>}
                            </div>
                        </div>
                    )
                }
            }

            const financialAccountColumn: ColumnDef<AssetData> = {
                id: 'financialAccount',
                accessorFn: row => row.title,
                header: () => <></>,
                cell: ({ row }) => {
                    const asset = row.original
                    const financialAccountId = asset.transactions?.[0]?.financialAccountId

                    if (!financialAccountId) return <></>

                    const account = accountQuery.data?.data.find(current => current.id === financialAccountId)

                    return account && <Badge variant='secondary'>{account.title}</Badge>
                }
            }

            const marketableColumns: ColumnDef<AssetData>[] = [
                {
                    id: 'quantity',
                    accessorFn: row => row.quantity || 0,
                    header: ({ column }) => (
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.quantity')}
                            <ArrowUpDown />
                        </Button>
                    ),
                    cell: ({ row }) => row.original.quantity || 0
                },
                {
                    id: 'price',
                    accessorFn: row => priceFor(row),
                    header: ({ column }) => (
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.price')}
                            <ArrowUpDown />
                        </Button>
                    ),
                    cell: ({ row }) => renderDecimalLabel(priceFor(row.original))
                },
                {
                    id: 'weight',
                    accessorFn: row => weightFor(row),
                    header: ({ column }) => (
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.weight')}
                            <ArrowUpDown />
                        </Button>
                    ),
                    cell: ({ row }) => `${renderDecimalLabel(weightFor(row.original), 0, 2)}%`
                }
            ]

            const physicalColumns: ColumnDef<AssetData>[] = [
                {
                    id: 'year',
                    accessorFn: row => row.vehicle?.year ?? 0,
                    header: ({ column }) => (
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.year')}
                            <ArrowUpDown />
                        </Button>
                    ),
                    cell: ({ row }) => row.original.vehicle?.year ?? '-'
                },
                {
                    id: 'buyDate',
                    accessorFn: row => buyDateFor(row) ?? '',
                    header: ({ column }) => (
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.buyDate')}
                            <ArrowUpDown />
                        </Button>
                    ),
                    cell: ({ row }) => {
                        const buyDate = buyDateFor(row.original)
                        return buyDate ? renderDate(buyDate) : '-'
                    }
                }
            ]

            const totalColumn: ColumnDef<AssetData> = {
                id: 'total',
                accessorFn: row => row.currentValue || 0,
                header: ({ column }) => (
                    <div className='text-right'>
                        <Button
                            variant='ghost'
                            className='text-white font-bold'
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            {t('investments.assets.table.total')}
                            <ArrowUpDown />
                        </Button>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className='text-right font-medium'>{renderPriceLabel(row.original.currentValue || 0)}</div>
                )
            }

            const actionsColumn: ColumnDef<AssetData> = {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const asset = row.original
                    return (
                        <div onClick={e => e.stopPropagation()} className='flex justify-end'>
                            <OptionsPopover<AssetData>
                                data={asset}
                                buttons={[
                                    {
                                        onClick: item => openEdit(item),
                                        label: t('buttons.editItem'),
                                        icon: 'pencil',
                                        hide: !isEditable(asset)
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

            return [
                nameColumn,
                financialAccountColumn,
                ...(layout === 'marketable' ? marketableColumns : physicalColumns),
                totalColumn,
                actionsColumn
            ]
        },
        [preferences.preferredCurrency, preferences.preferredLanguage, portfolioTotal, accountQuery.data]
    )
}
