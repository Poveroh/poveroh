import { DashboardLayout } from '@poveroh/types'

export const DASHBOARD_DEFAULT_LAYOUT: DashboardLayout = {
    version: 1,
    items: [
        { id: 'kpi-row', colSpan: 12, minHeight: 140, visible: true },
        { id: 'liquidity-evolution', colSpan: 12, minHeight: 360, visible: true },
        { id: 'income-expense-month', colSpan: 12, minHeight: 360, visible: true },
        { id: 'month-comparison', colSpan: 12, minHeight: 360, visible: true },
        { id: 'category-trend', colSpan: 12, minHeight: 360, visible: true },
        { id: 'account-balances', colSpan: 6, minHeight: 320, visible: true },
        { id: 'expense-macro-distribution', colSpan: 6, minHeight: 320, visible: true },
        { id: 'recent-transactions', colSpan: 12, minHeight: 360, visible: true }
    ]
}
