'use client'

import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { useDashboardLayout } from '@/hooks/dashboard/use-dashboard-layout'
import { PageWrapper } from '@/components/box/page-wrapper'

export default function DashBoardPage() {
    const { layout, isLoading, saveLayout } = useDashboardLayout()

    if (isLoading) {
        return <p className='text-muted-foreground'>Caricamento dashboard...</p>
    }

    return (
        <PageWrapper>
            <DashboardGrid items={layout.items} onReorder={items => saveLayout({ ...layout, items })} />
        </PageWrapper>
    )
}
