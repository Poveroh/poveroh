import { GetDashboardLayout } from '@poveroh/types'

export const DashboardTemplate: GetDashboardLayout = {
    layout: [
        {
            id: 'net-worth-evolution',
            colSpan: '12',
            visible: true,
            minHeight: 140
        },
        {
            id: 'recent-transactions',
            colSpan: '12',
            visible: true,
            minHeight: 360
        }
    ],
    version: 1
}
