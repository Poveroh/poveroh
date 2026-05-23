'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Header } from '@/components/other/header-page'
import { PageWrapper } from '@/components/box/page-wrapper'
import { InvestmentAssetDialog } from '@/components/dialog/investment-asset-dialog'

import { useAsset } from '@/hooks/use-asset'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { AssetData } from '@poveroh/types'
import { CryptoDialog } from '@/components/dialog/investment/crypto-symbol-dialog'

export default function InvestmentsView() {
    const t = useTranslations()
    const { assetQuery, deleteAllMutation } = useAsset()
    const { openModal } = useModal<AssetData>(MODAL_IDS.INVESTMENT_ASSET)

    const assets = useMemo(() => (assetQuery.data?.data ?? []) as AssetData[], [assetQuery.data])

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
            </PageWrapper>

            <InvestmentAssetDialog />
            <CryptoDialog />
        </>
    )
}
