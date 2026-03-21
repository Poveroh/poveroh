'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardLayoutItem } from '@poveroh/types'
import { DASHBOARD_DEFAULT_LAYOUT } from '@/components/dashboard/layout'
import { getDashboardLayoutOptions, getDashboardLayoutQueryKey } from '@/api/@tanstack/react-query.gen'
import { updateDashboardLayout } from '@/api/sdk.gen'
import type { DashboardLayoutItem as ApiDashboardLayoutItem } from '@/api/types.gen'

type DashboardLayout = {
    items: DashboardLayoutItem[]
}

type UseDashboardLayout = {
    layout: DashboardLayout
    isLoading: boolean
    saveLayout: (next: DashboardLayout) => Promise<void>
}

export const useDashboardLayout = (): UseDashboardLayout => {
    const queryClient = useQueryClient()
    const defaultLayout = useMemo<DashboardLayout>(
        () => ({
            items: DASHBOARD_DEFAULT_LAYOUT.widgets
        }),
        []
    )
    const [layout, setLayout] = useState<DashboardLayout>(defaultLayout)
    const [layoutVersion, setLayoutVersion] = useState<number>(DASHBOARD_DEFAULT_LAYOUT.version)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let active = true

        const load = async () => {
            try {
                const response = await queryClient.fetchQuery(getDashboardLayoutOptions())
                if (!active) return

                if (response?.success && response.data?.layout) {
                    setLayout({ items: response.data.layout as DashboardLayoutItem[] })
                    setLayoutVersion(response.data.version)
                } else {
                    setLayout(defaultLayout)
                    await updateDashboardLayout({
                        body: {
                            version: DASHBOARD_DEFAULT_LAYOUT.version,
                            layout: DASHBOARD_DEFAULT_LAYOUT.widgets as ApiDashboardLayoutItem[]
                        },
                        throwOnError: true
                    })
                }
            } catch {
                if (active) {
                    setLayout(defaultLayout)
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
    }, [defaultLayout, queryClient])

    const saveLayout = useCallback(
        async (next: DashboardLayout) => {
            setLayout(next)
            await updateDashboardLayout({
                body: {
                    version: layoutVersion,
                    layout: next.items as ApiDashboardLayoutItem[]
                },
                throwOnError: true
            })
            queryClient.invalidateQueries({ queryKey: getDashboardLayoutQueryKey() })
        },
        [layoutVersion, queryClient]
    )

    return { layout, isLoading, saveLayout }
}
