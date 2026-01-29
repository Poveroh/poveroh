'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@poveroh/types'
import { DashboardService } from '@/services/dashboard.service'
import { DASHBOARD_DEFAULT_LAYOUT } from '@/components/dashboard/layout'

type UseDashboardLayout = {
    layout: DashboardLayout
    isLoading: boolean
    saveLayout: (next: DashboardLayout) => Promise<void>
}

export const useDashboardLayout = (): UseDashboardLayout => {
    const service = useMemo(() => new DashboardService(), [])
    const [layout, setLayout] = useState<DashboardLayout>(DASHBOARD_DEFAULT_LAYOUT)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                const stored = await service.read()
                if (!active) return

                if (stored?.layout) {
                    setLayout(stored.layout)
                } else {
                    setLayout(DASHBOARD_DEFAULT_LAYOUT)
                    await service.save(DASHBOARD_DEFAULT_LAYOUT)
                }
            } catch {
                if (active) {
                    setLayout(DASHBOARD_DEFAULT_LAYOUT)
                }
            } finally {
                if (active) {
                    setIsLoading(false)
                }
            }
        }

        load()

        return () => {
            active = false
        }
    }, [service])

    const saveLayout = useCallback(
        async (next: DashboardLayout) => {
            setLayout(next)
            await service.save(next)
        },
        [service]
    )

    return { layout, isLoading, saveLayout }
}
