'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ListFilter, Search } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { ASSET_GROUP_CATALOG, type AssetData, type AssetTypeEnum } from '@poveroh/types'

import Box from '@/components/box/box-wrapper'
import { DataTable } from '@/components/table/data-table'
import { useAsset } from '@/hooks/use-asset'
import { useAssetColumns } from '@/hooks/use-asset-columns'
import { useFinancialAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import BoxItem from '../box/box-item'

/**
 * Renders the investments summary: a search/filter toolbar followed by one table per asset-type group.
 * @param assets The assets to display, already fetched by the page.
 * @returns The summary section element.
 */
export function AssetSummary({ assets }: { assets: AssetData[] }) {
    const t = useTranslations()
    const { deleteMutation } = useAsset()
    const { accountQuery } = useFinancialAccount()

    const ticketModal = useModal<AssetData>(MODAL_IDS.TICKET_SYMBOL)
    const cryptoModal = useModal<AssetData>(MODAL_IDS.CRYPTO_DIALOG)
    const propertyModal = useModal<AssetData>(MODAL_IDS.PROPERTY_DIALOG)
    const vehicleModal = useModal<AssetData>(MODAL_IDS.VEHICLE_DIALOG)

    const [search, setSearch] = useState('')

    const editModalByType: Partial<Record<AssetTypeEnum, typeof ticketModal>> = {
        STOCK: ticketModal,
        CRYPTOCURRENCY: cryptoModal,
        REAL_ESTATE: propertyModal,
        VEHICLE: vehicleModal
    }

    const accountsById = useMemo(() => {
        const map = new Map<string, string>()
        for (const account of accountQuery.data?.data ?? []) {
            map.set(account.id, account.title)
        }
        return map
    }, [accountQuery.data])

    const portfolioTotal = useMemo(() => assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0), [assets])

    const filteredAssets = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return assets

        return assets.filter(asset => {
            const haystack = [
                asset.title,
                asset.marketable?.symbol,
                asset.marketable?.isin,
                asset.vehicle?.plateNumber,
                asset.realEstate?.address
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return haystack.includes(query)
        })
    }, [assets, search])

    const groups = useMemo(
        () =>
            ASSET_GROUP_CATALOG.map(group => ({
                group,
                assets: filteredAssets.filter(asset => asset.type === group.type)
            })).filter(entry => entry.assets.length > 0),
        [filteredAssets]
    )

    const resolveAccount = (financialAccountId?: string | null) =>
        financialAccountId ? accountsById.get(financialAccountId) : undefined

    const isEditable = (asset: AssetData) => Boolean(editModalByType[asset.type])

    const openEdit = (asset: AssetData) => {
        editModalByType[asset.type]?.openModal('edit', asset)
    }

    const openDelete = (asset: AssetData) => {
        deleteMutation.mutate({ path: { id: asset.id } })
    }

    const buildColumns = useAssetColumns({ portfolioTotal, resolveAccount, isEditable, openEdit, openDelete })

    return (
        <div className='flex flex-col space-y-8'>
            <div className='flex flex-row space-x-3'>
                <Input
                    startIcon={Search}
                    placeholder={t('messages.search')}
                    className='w-80'
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                />
                <Button variant='secondary' className='flex items-center gap-2'>
                    <ListFilter className='h-4 w-4' />
                    {t('investments.assets.summary.otherFilters')}
                </Button>
            </div>

            {groups.length === 0 ? (
                <p className='sub text-center py-10'>{t('messages.noResult')}</p>
            ) : (
                <Box noDivide gap={10}>
                    {groups.map(({ group, assets: groupAssets }) => (
                        <BoxItem
                            key={group.type}
                            header={{
                                title: t(group.label)
                            }}
                        >
                            <DataTable columns={buildColumns(group.layout)} data={groupAssets} showFooter={false} />
                        </BoxItem>
                    ))}
                </Box>
            )}
        </div>
    )
}
