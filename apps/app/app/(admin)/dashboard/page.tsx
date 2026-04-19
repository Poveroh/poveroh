'use client'

import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { PageWrapper } from '@/components/box/page-wrapper'
import { Header } from '@/components/other/header-page'
import { useTranslations } from 'next-intl'
import { useUser } from '@/hooks/use-user'

export default function DashBoardPage() {
    const t = useTranslations()
    const { user } = useUser()

    const currentHour = new Date().getHours()

    const getGreeting = () => {
        if (currentHour < 12) {
            return t('dashboard.morning', { a: user?.name })
        } else if (currentHour < 18) {
            return t('dashboard.afternoon', { a: user?.name })
        } else {
            return t('dashboard.evening', { a: user?.name })
        }
    }

    return (
        <PageWrapper>
            <Header title={getGreeting()} subtitle={t('dashboard.subtitle')} />
            <DashboardGrid />
        </PageWrapper>
    )
}
