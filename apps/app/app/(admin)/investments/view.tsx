'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Header } from '@/components/other/header-page'
import { PageWrapper } from '@/components/box/page-wrapper'
import { InvestmentAssetDialog } from '@/components/dialog/investment-asset-dialog'

import { AssetContent } from '@/components/investments/asset-content'
import { InvestmentSummary } from '@/components/investments/investment-summary'
import { InvestmentToolbar } from '@/components/investments/investment-toolbar'
import { ASSET_GROUPS, getLiveAssetsCount, getPortfolioValue } from '@/components/investments/investment-utils'
import { useAsset } from '@/hooks/use-asset'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { AssetData } from '@poveroh/types'
import { CryptoDialog } from '@/components/dialog/investment/crypto-symbol-dialog'
import { PropertyAssetDialog } from '@/components/dialog/investment/property-asset-dialog'
import { TicketSymbolDialog } from '@/components/dialog/investment/ticket-symbol-dialog'
import { ValuableAssetDialog, OtherAssetDialog } from '@/components/dialog/investment/valuable-asset-dialog'
import { VehicleAssetDialog } from '@/components/dialog/investment/vehicle-asset-dialog'

export default function InvestmentsView() {
    const t = useTranslations()
    const [year, setYear] = useState('2026')
    const { assetQuery, portfolioSummaryQuery, deleteAllMutation, onSearch } = useAsset()
    const { openModal } = useModal<AssetData>(MODAL_IDS.INVESTMENT_ASSET)

    const assets = useMemo(() => (assetQuery.data?.data ?? []) as AssetData[], [assetQuery.data])
    const totalValue = portfolioSummaryQuery.data?.data?.totalCurrentValue ?? getPortfolioValue(assets)
    const liveAssets = portfolioSummaryQuery.data?.data?.totalWithLiveMarketData ?? getLiveAssetsCount(assets)
    const summaryLabels = {
        balance: t('investments.summary.balance'),
        live: t('investments.summary.live')
    }
    const tableLabels = {
        name: t('investments.assets.table.name'),
        year: t('investments.assets.table.year'),
        buyDate: t('investments.assets.table.buyDate'),
        quantity: t('investments.assets.table.quantity'),
        price: t('investments.assets.table.price'),
        weight: t('investments.assets.table.weight'),
        total: t('investments.assets.table.total')
    }
    const groupLabels = ASSET_GROUPS.reduce<Record<string, string>>((labels, group) => {
        labels[group.key] = t(group.titleKey)
        return labels
    }, {})

    return (
        <>
            <PageWrapper>
                <Header
                    title={t('investments.title')}
                    breadcrumbs={[{ label: t('dashboard.title'), href: '/' }, { label: t('investments.title') }]}
                    fetchAction={{
                        onClick: assetQuery.refetch,
                        loading: assetQuery.isFetching
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: false
                    }}
                    onDeleteAll={{
                        onClick: () => deleteAllMutation.mutate({}),
                        loading: deleteAllMutation.isPending,
                        disabled: assets.length === 0
                    }}
                />

                <InvestmentSummary
                    totalValue={totalValue}
                    liveAssets={liveAssets}
                    year={year}
                    onYearChange={setYear}
                    labels={summaryLabels}
                />

                <section className='rounded-lg bg-box p-8'>
                    <div className='space-y-8'>
                        <InvestmentToolbar
                            searchPlaceholder={t('investments.search.placeholder')}
                            filterLabel={t('investments.filters.other')}
                            onSearch={onSearch}
                        />

                        <div className='space-y-10'>
                            <AssetContent
                                isLoading={assetQuery.isFetching}
                                assets={assets}
                                totalValue={totalValue}
                                labels={tableLabels}
                                groupLabels={groupLabels}
                                emptyTitle={t('investments.empty.title')}
                                emptySubtitle={t('investments.empty.subtitle')}
                            />
                        </div>
                    </div>
                </section>
            </PageWrapper>

            <InvestmentAssetDialog />
            <TicketSymbolDialog />
            <CryptoDialog />
            <PropertyAssetDialog />
            <VehicleAssetDialog />
            <ValuableAssetDialog />
            <OtherAssetDialog />
        </>
    )
}
