'use client'

import { PageWrapper } from '@/components/box/page-wrapper'
import { NetWorthWidget } from '@/components/widget/net-worth'

export default function DashBoardView() {
    return (
        <PageWrapper>
            <NetWorthWidget />
        </PageWrapper>
    )
}
