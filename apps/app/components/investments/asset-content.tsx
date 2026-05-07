import { Button } from '@poveroh/ui/components/button'
import { Building2, Car, Circle, Ellipsis, Gem, TrendingUp } from 'lucide-react'

import SkeletonItem from '@/components/skeleton/skeleton-item'
import { ASSET_GROUPS, formatCurrency, getAssetCurrentValue } from '@/components/investments/investment-utils'
import type { AssetTableLabels } from '@/components/investments/investment-utils'
import type { AssetData } from '@poveroh/types'

const getAssetSymbol = (asset: AssetData) => {
    if (asset.marketable?.symbol) return asset.marketable.symbol
    if (asset.marketable?.isin) return asset.marketable.isin
    if (asset.vehicle?.plateNumber) return asset.vehicle.plateNumber
    if (asset.realEstate?.address) return asset.realEstate.address
    return asset.type.replaceAll('_', ' ')
}

const getAssetIcon = (asset: AssetData) => {
    if (asset.type === 'VEHICLE') return <Car className='h-5 w-5' />
    if (asset.type === 'REAL_ESTATE') return <Building2 className='h-5 w-5' />
    if (asset.type === 'COLLECTIBLE') return <Gem className='h-5 w-5' />
    if (asset.type === 'CRYPTOCURRENCY') return <span className='text-sm font-bold'>₿</span>
    if (asset.type === 'STOCK' || asset.type === 'ETF' || asset.type === 'BOND')
        return <TrendingUp className='h-5 w-5' />
    return <Circle className='h-5 w-5' />
}

const getAssetQuantity = (asset: AssetData) => asset.position?.quantity ?? null

const getAssetPrice = (asset: AssetData) => {
    const quantity = getAssetQuantity(asset)
    if (quantity && asset.currentValue) return asset.currentValue / quantity
    return asset.position?.averageCost ?? asset.currentValue ?? null
}

function EmptyAssetState({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className='flex w-full justify-center pt-20'>
            <div className='flex w-[400px] flex-col items-center justify-center space-y-8 text-center'>
                <TrendingUp className='h-16 w-16' />
                <div className='space-y-2'>
                    <h4>{title}</h4>
                    <p className='text-muted-foreground'>{subtitle}</p>
                </div>
            </div>
        </div>
    )
}

function AssetTable({
    title,
    assets,
    totalPortfolio,
    labels
}: {
    title: string
    assets: AssetData[]
    totalPortfolio: number
    labels: AssetTableLabels
}) {
    if (assets.length === 0) return null

    const isVehicleGroup = assets.every(asset => asset.type === 'VEHICLE')

    return (
        <section className='space-y-4'>
            <h4>{title}</h4>
            <div className='overflow-hidden rounded-lg border border-hr'>
                <table className='w-full text-sm'>
                    <thead className='bg-muted'>
                        <tr className='h-12 text-left'>
                            <th className='w-16 px-5'></th>
                            <th className='px-2 font-semibold'>{labels.name}</th>
                            {isVehicleGroup ? (
                                <>
                                    <th className='px-2 font-semibold'>{labels.year}</th>
                                    <th className='px-2 font-semibold'>{labels.buyDate}</th>
                                </>
                            ) : (
                                <>
                                    <th className='px-2 font-semibold'>{labels.quantity}</th>
                                    <th className='px-2 font-semibold'>{labels.price}</th>
                                    <th className='px-2 font-semibold'>{labels.weight}</th>
                                </>
                            )}
                            <th className='px-2 text-right font-semibold'>{labels.total}</th>
                            <th className='w-14 px-5'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => {
                            const currentValue = getAssetCurrentValue(asset)
                            const weight = totalPortfolio > 0 ? (currentValue / totalPortfolio) * 100 : 0
                            const quantity = getAssetQuantity(asset)
                            const price = getAssetPrice(asset)

                            return (
                                <tr key={asset.id} className='h-16 border-t border-hr'>
                                    <td className='px-5'>
                                        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground'>
                                            {getAssetIcon(asset)}
                                        </div>
                                    </td>
                                    <td className='px-2'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <div>
                                                <p className='font-medium'>{asset.title}</p>
                                                <p className='text-xs text-muted-foreground'>{getAssetSymbol(asset)}</p>
                                            </div>
                                            {asset.marketable?.exchange && (
                                                <span className='rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground'>
                                                    {asset.marketable.exchange}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    {isVehicleGroup ? (
                                        <>
                                            <td className='px-2'>{asset.vehicle?.year ?? '-'}</td>
                                            <td className='px-2'>
                                                {asset.vehicle?.purchaseDate
                                                    ? new Date(asset.vehicle.purchaseDate).toLocaleDateString('it-IT')
                                                    : '-'}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className='px-2'>{quantity ?? '-'}</td>
                                            <td className='px-2'>{price ? price.toFixed(2) : '-'}</td>
                                            <td className='px-2'>{weight.toFixed(0)}%</td>
                                        </>
                                    )}
                                    <td className='px-2 text-right'>{formatCurrency(currentValue, asset.currency)}</td>
                                    <td className='px-5 text-right'>
                                        <Button size='icon' variant='ghost'>
                                            <Ellipsis />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export function AssetContent({
    isLoading,
    assets,
    totalValue,
    labels,
    groupLabels,
    emptyTitle,
    emptySubtitle
}: {
    isLoading: boolean
    assets: AssetData[]
    totalValue: number
    labels: AssetTableLabels
    groupLabels: Record<string, string>
    emptyTitle: string
    emptySubtitle: string
}) {
    if (isLoading && assets.length === 0) return <SkeletonItem repeat={5} />

    if (assets.length === 0) return <EmptyAssetState title={emptyTitle} subtitle={emptySubtitle} />

    return ASSET_GROUPS.map(group => (
        <AssetTable
            key={group.key}
            title={groupLabels[group.key] ?? group.key}
            assets={assets.filter(asset => group.types.includes(asset.type))}
            totalPortfolio={totalValue}
            labels={labels}
        />
    ))
}
