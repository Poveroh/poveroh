'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ListFilter, Search } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { ASSET_GROUP_CATALOG, type AssetData, type AssetTypeEnum } from '@poveroh/types'

import Box from '@/components/box/box-wrapper'
import { DataTable } from '@/components/table/data-table'
import { DeleteModal } from '@/components/modal/delete-modal'
import { useAsset } from '@/hooks/use-asset'
import { useAssetColumns } from '@/hooks/use-asset-columns'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useFinancialAccount } from '@/hooks/use-account'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import BoxItem from '../box/box-item'

type AssetSummaryProps = {
    assets: AssetData[]
    onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Returns the key used to merge rows of the same holding (same market symbol), or undefined when the asset is unique.
 * @param asset The asset to derive the merge key from.
 * @returns The market symbol when present, otherwise undefined.
 */
const mergeKeyFor = (asset: AssetData): string | undefined => asset.marketable?.symbol ?? undefined

/**
 * Reorders assets so positions sharing the same symbol sit next to each other, preserving each symbol's first-appearance order.
 * @param list The assets belonging to a single asset-type group.
 * @returns The assets clustered by symbol.
 */
const clusterBySymbol = (list: AssetData[]): AssetData[] => {
    const order: string[] = []
    const buckets = new Map<string, AssetData[]>()

    for (const asset of list) {
        const key = mergeKeyFor(asset) ?? asset.id
        if (!buckets.has(key)) {
            buckets.set(key, [])
            order.push(key)
        }
        buckets.get(key)?.push(asset)
    }

    return order.flatMap(key => buckets.get(key) ?? [])
}

/**
 * Renders the investments summary: a search/filter toolbar followed by one table per asset-type group.
 * @param assets The assets to display, already fetched and filtered by the page query.
 * @param onSearch The change handler that forwards the search text to the backend asset filter.
 * @returns The summary section element.
 */
export function AssetSummary({ assets, onSearch }: AssetSummaryProps) {
    const t = useTranslations()
    const { deleteMutation } = useAsset()
    const { accountQuery } = useFinancialAccount()
    const deleteModal = useDeleteModal<AssetData>()

    const ticketModal = useModal<AssetData>(MODAL_IDS.TICKET_SYMBOL)
    const cryptoModal = useModal<AssetData>(MODAL_IDS.CRYPTO_DIALOG)
    const propertyModal = useModal<AssetData>(MODAL_IDS.PROPERTY_DIALOG)
    const vehicleModal = useModal<AssetData>(MODAL_IDS.VEHICLE_DIALOG)
    const valuableModal = useModal<AssetData>(MODAL_IDS.VALUABLE_DIALOG)
    const otherAssetModal = useModal<AssetData>(MODAL_IDS.OTHER_ASSETS_DIALOG)

    const editModalByType: Partial<Record<AssetTypeEnum, typeof ticketModal>> = {
        STOCK: ticketModal,
        CRYPTO: cryptoModal,
        REAL_ESTATE: propertyModal,
        VEHICLE: vehicleModal,
        COLLECTIBLE: valuableModal,
        OTHER: otherAssetModal
    }

    const accountsById = useMemo(() => {
        const map = new Map<string, string>()
        for (const account of accountQuery.data?.data ?? []) {
            map.set(account.id, account.title)
        }
        return map
    }, [accountQuery.data])

    const portfolioTotal = useMemo(() => assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0), [assets])

    const groups = useMemo(
        () =>
            ASSET_GROUP_CATALOG.map(group => ({
                group,
                assets: clusterBySymbol(assets.filter(asset => asset.type === group.type))
            })).filter(entry => entry.assets.length > 0),
        [assets]
    )

    const resolveAccount = (financialAccountId?: string | null) =>
        financialAccountId ? accountsById.get(financialAccountId) : undefined

    const isEditable = (asset: AssetData) => Boolean(editModalByType[asset.type])

    const openEdit = (asset: AssetData) => {
        editModalByType[asset.type]?.openModal('edit', asset)
    }

    const openDelete = (asset: AssetData) => {
        deleteModal.openModal(asset)
    }

    const onDelete = async () => {
        const asset = deleteModal.item
        if (!asset) return

        deleteModal.setLoading(true)

        try {
            await deleteMutation.mutateAsync({ path: { id: asset.id } })
        } finally {
            deleteModal.closeModal()
        }
    }

    const buildColumns = useAssetColumns({ portfolioTotal, resolveAccount, isEditable, openEdit, openDelete })

    return (
        <div className='flex flex-col space-y-8'>
            <Box noDivide gap={10}>
                <div className='flex flex-row space-x-3'>
                    <Input startIcon={Search} placeholder={t('messages.search')} className='w-80' onChange={onSearch} />
                    <Button variant='secondary' className='flex items-center gap-2'>
                        <ListFilter className='h-4 w-4' />
                        {t('investments.assets.summary.otherFilters')}
                    </Button>
                </div>
                {groups.length === 0 ? (
                    <p className='sub text-center py-10'>{t('messages.noResult')}</p>
                ) : (
                    groups.map(({ group, assets: groupAssets }) => (
                        <BoxItem
                            key={group.type}
                            header={{
                                title: t(group.label)
                            }}
                        >
                            <DataTable
                                columns={buildColumns(group.layout)}
                                data={groupAssets}
                                showFooter={false}
                                mergeRowsBy={mergeKeyFor}
                            />
                        </BoxItem>
                    ))
                )}
            </Box>

            <DeleteModal
                title={deleteModal.item?.title ?? ''}
                description={t('investments.assets.modal.deleteDescription')}
                loading={deleteModal.loading}
                open={deleteModal.isOpen}
                closeDialog={deleteModal.closeModal}
                onConfirm={onDelete}
            />
        </div>
    )
}
