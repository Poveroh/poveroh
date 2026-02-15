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

export type DashboardLayout = {
    version: number
    items: DashboardLayoutItem[]
}

export type DashboardLayoutInput = DashboardLayout

export interface IDashboardLayout {
    id: string
    userId: string
    version: number
    layout: DashboardLayout
    createdAt: string
    updatedAt: string
}
