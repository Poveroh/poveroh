'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil, Plus, Upload } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import { PageWrapper } from '@/components/box/page-wrapper'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import { Header } from '@/components/other/header-page'
import { AccountDialog } from '@/components/dialog/account-dialog'
import { ImportDrawer } from '@/components/drawer/import-drawer'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'

import { AccountBalanceCard } from '@/components/accounts/account-balance-card'
import { AccountTransactionsSection } from '@/components/accounts/account-transactions-section'

import { useAccountDetail } from '@/hooks/use-account-detail'
import { useAccountBalanceHistory } from '@/hooks/use-account-balance'
import { useLocalChartRange } from '@/hooks/use-local-chart-range'
import { useModal } from '@/hooks/use-modal'
import { useDrawer } from '@/hooks/use-drawer'

import { getRangeBounds } from '@/lib/chart-range'
import { MODAL_IDS } from '@/types/constant'
import {
    ACCOUNT_RANGES,
    AccountVariation,
    Amount,
    FinancialAccountData,
    ImportData,
    TransactionData
} from '@poveroh/types'

type AccountDetailViewProps = {
    id: string
}

export default function AccountDetailView({ id }: AccountDetailViewProps) {
    const t = useTranslations()
    const router = useRouter()

    const { account, isLoading, isFetching, refetch, deleteMutation } = useAccountDetail(id)
    const { openModal } = useModal<FinancialAccountData>(MODAL_IDS.ACCOUNT)
    const { openModal: openModelTransaction } = useModal<Partial<TransactionData>>(MODAL_IDS.TRANSACTION)
    const importDrawer = useDrawer<ImportData>()

    const { range, setRange, options } = useLocalChartRange('30D', ACCOUNT_RANGES)

    const bounds = useMemo(() => getRangeBounds(range, new Date()), [range])
    const balanceQuery = useAccountBalanceHistory(id, bounds.start?.toISOString(), bounds.end?.toISOString())
    const series = balanceQuery.data ?? []

    const variation = useMemo<AccountVariation | null>(() => {
        const first = series[0]
        const last = series[series.length - 1]
        if (!first || !last || first === last) return null

        const delta = last.balance - first.balance
        const deltaPct = first.balance !== 0 ? (delta / first.balance) * 100 : 0

        return { delta, deltaPct, isPositive: delta >= 0 }
    }, [series])

    const onDelete = async () => {
        const response = await deleteMutation.mutateAsync({ path: { id } })
        if (response?.success) {
            router.push('/accounts')
        }
    }

    return (
        <>
            <PageWrapper>
                {isLoading ? (
                    <SkeletonItem repeat={5} />
                ) : !account ? (
                    <div className='flex flex-col items-center space-y-2 justify-center h-[300px] text-center'>
                        <h4>{t('accounts.detail.notFound.title')}</h4>
                        <p className='text-muted-foreground'>{t('accounts.detail.notFound.subtitle')}</p>
                    </div>
                ) : (
                    <>
                        <Header
                            title={account.title}
                            breadcrumbs={[
                                { label: t('dashboard.title'), href: '/' },
                                { label: t('accounts.title'), href: '/accounts' },
                                { label: account.title }
                            ]}
                            icon={account.logoIcon}
                            fetchAction={{
                                onClick: () => {
                                    refetch()
                                    balanceQuery.refetch()
                                },
                                loading: isFetching
                            }}
                            addAction={[
                                {
                                    onClick: () => openModal('edit', account),
                                    label: t('buttons.editItem'),
                                    icon: <Pencil className='mr-2' />,
                                    loading: false
                                },
                                {
                                    onClick: () =>
                                        openModelTransaction('create', undefined, {
                                            amounts: [{ financialAccountId: id } as Amount]
                                        }),
                                    label: t('buttons.add.transaction'),
                                    icon: <Plus className='mr-2' />,
                                    loading: false
                                },
                                {
                                    onClick: () =>
                                        importDrawer.openDrawer('create', {
                                            financialAccountId: id
                                        } as ImportData),
                                    label: t('imports.title'),
                                    icon: <Upload className='mr-2' />,
                                    loading: false
                                }
                            ]}
                            onDelete={{
                                onClick: onDelete,
                                loading: deleteMutation.isPending,
                                label: account.title,
                                multiple: false
                            }}
                        />

                        <AccountBalanceCard
                            currentBalance={account.balance}
                            variation={variation}
                            dataPoints={series}
                            range={range}
                            options={options}
                            onRangeChange={setRange}
                        />

                        <Tabs defaultValue='overview' className='w-full'>
                            <TabsList className='w-[300px] grid grid-cols-2'>
                                <TabsTrigger value='overview'>{t('accounts.detail.tabs.overview')}</TabsTrigger>
                                <TabsTrigger value='portfolio'>{t('accounts.detail.tabs.portfolio')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value='overview' className='mt-8'>
                                <AccountTransactionsSection accountId={id} />
                            </TabsContent>
                            <TabsContent value='portfolio' className='mt-8'>
                                <div className='flex flex-col items-center space-y-2 justify-center h-[200px] text-center'>
                                    <p className='text-muted-foreground'>{t('accounts.detail.portfolio.empty')}</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </PageWrapper>

            <AccountDialog />
            <ImportDrawer />
            <TransactionDialog />
        </>
    )
}
