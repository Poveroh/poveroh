'use client'

import { useMemo } from 'react'
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { useDashboardLayout } from '@/hooks/dashboard/use-dashboard-layout'
import { DashboardWidgetId } from '@poveroh/types'
import { KpiRow } from '@/components/dashboard/widgets/kpi-row'
import { LiquidityEvolutionWidget } from '@/components/dashboard/widgets/liquidity-evolution-widget'
import { IncomeExpenseMonthWidget } from '@/components/dashboard/widgets/income-expense-month-widget'
import { MonthComparisonWidget } from '@/components/dashboard/widgets/month-comparison-widget'
import { CategoryTrendWidget } from '@/components/dashboard/widgets/category-trend-widget'
import { AccountBalancesWidget } from '@/components/dashboard/widgets/account-balances-widget'
import { ExpenseMacroDistributionWidget } from '@/components/dashboard/widgets/expense-macro-distribution-widget'
import { RecentTransactionsWidget } from '@/components/dashboard/widgets/recent-transactions-widget'

export default function DashBoardPage() {
    const { layout, isLoading, saveLayout } = useDashboardLayout()

    const renderWidget = useMemo(
        () => (id: DashboardWidgetId) => {
            switch (id) {
                case 'kpi-row':
                    return <KpiRow />
                case 'liquidity-evolution':
                    return <LiquidityEvolutionWidget />
                case 'income-expense-month':
                    return <IncomeExpenseMonthWidget />
                case 'month-comparison':
                    return <MonthComparisonWidget />
                case 'category-trend':
                    return <CategoryTrendWidget />
                case 'account-balances':
                    return <AccountBalancesWidget />
                case 'expense-macro-distribution':
                    return <ExpenseMacroDistributionWidget />
                case 'recent-transactions':
                    return <RecentTransactionsWidget />
                default:
                    return null
            }
        },
        []
    )

    if (isLoading) {
        return <p className='text-muted-foreground'>Caricamento dashboard...</p>
    }

    return (
        <div className='flex flex-col gap-6'>
            <DashboardGrid
                items={layout.items}
                onReorder={items => saveLayout({ ...layout, items })}
                renderWidget={renderWidget}
            />
        </div>
    )
}
