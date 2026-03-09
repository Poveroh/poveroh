export type DashboardWidgetId =
    | 'net-worth-evolution'
    | 'kpi-row'
    | 'liquidity-evolution'
    | 'income-expense-month'
    | 'month-comparison'
    | 'category-trend'
    | 'account-balances'
    | 'expense-macro-distribution'
    | 'recent-transactions'

export type DashboardLayoutItem = {
    id: DashboardWidgetId
    colSpan: 12 | 6 | 4 | 3
    minHeight?: number
    visible?: boolean
}
