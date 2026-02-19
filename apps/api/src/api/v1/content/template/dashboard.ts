import { DashboardLayout } from '@poveroh/types'

export const DashboardTemplate: DashboardLayout = {
    items: [
        {
            id: 'net-worth-evolution',
            colSpan: 12,
            visible: true,
            minHeight: 140
        },
        {
            id: 'recent-transactions',
            colSpan: 12,
            visible: true,
            minHeight: 360
        }
    ],
    version: 1
}
