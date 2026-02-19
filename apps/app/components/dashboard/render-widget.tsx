import { DashboardWidgetId } from '@poveroh/types/dist'
import { AccountBalancesWidget } from './widgets/account-balances-widget'
import { CategoryTrendWidget } from './widgets/category-trend-widget'
import { ExpenseMacroDistributionWidget } from './widgets/expense-macro-distribution-widget'
import { IncomeExpenseMonthWidget } from './widgets/income-expense-month-widget'
import { KpiRow } from './widgets/kpi-row'
import { LiquidityEvolutionWidget } from './widgets/liquidity-evolution-widget'
import { MonthComparisonWidget } from './widgets/month-comparison-widget'
import { NetWorthEvolutionWidget } from './widgets/net-worth-evolution-widget'
import { RecentTransactionsWidget } from './widgets/recent-transactions-widget'

type WidgetProps = {
    id: DashboardWidgetId
}

export const Widget = ({ id }: WidgetProps) => {
    switch (id) {
        case 'net-worth-evolution':
            return <NetWorthEvolutionWidget />
        case 'recent-transactions':
            return <RecentTransactionsWidget />
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

        default:
            return null
    }
}
