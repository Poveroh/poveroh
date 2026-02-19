'use client'

import Box from '@/components/box/box-wrapper'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useReport } from '@/hooks/use-report'
import { INetWorthEvolutionReport } from '@poveroh/types/dist'
import { NetWorthEvolutionChart } from '../charts/net-worth-evolution-chart'
import { useChartRange } from '@/hooks/use-chart-range'
import { ChartRangeSelect } from '../../fields/chart-range-select'

export const NetWorthEvolutionWidget = () => {
    const [isLive] = useState(false)
    const [data, setData] = useState<INetWorthEvolutionReport | null>(null)
    const t = useTranslations('widget.net-worth-evolution')

    const { getNetWorthEvolution } = useReport()
    const { range, getRangeFilter } = useChartRange()

    useEffect(() => {
        const fetchData = async () => {
            const filter = getRangeFilter()
            const response = await getNetWorthEvolution(filter)
            setData(response)
        }

        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range])

    const formatCurrency = (value: number) =>
        value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

    const comparison = useMemo(() => {
        if (!data?.dataPoints?.length) return null

        const latest = data.dataPoints[data.dataPoints.length - 1]
        const reference = data.dataPoints[0]

        if (!latest || !reference) return null

        const delta = latest.totalNetWorth - reference.totalNetWorth
        const deltaPct = reference.totalNetWorth ? (delta / reference.totalNetWorth) * 100 : 0

        return {
            delta,
            deltaPct,
            isPositive: delta >= 0
        }
    }, [data])

    return (
        <Box>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-6'>
                            <p className='sub uppercase'>{t('totalBalance')}</p>
                            {isLive && (
                                <div className='flex flex-row items-center gap-2'>
                                    <span className='dot bg-success'></span>
                                    <p className='success uppercase'>{t('live')}</p>
                                </div>
                            )}
                        </div>
                        <h2>$ {data ? data.totalNetWorth.toFixed(2) : '0.00'}</h2>
                        {comparison && (
                            <div className='flex items-center gap-2 text-sm'>
                                <span className={comparison.isPositive ? 'text-emerald-500' : 'text-red-500'}>
                                    {`${comparison.isPositive ? '+' : '-'}${formatCurrency(
                                        Math.abs(comparison.delta)
                                    )} (${comparison.isPositive ? '+' : '-'}${Math.abs(comparison.deltaPct).toFixed(1)}%)`}
                                </span>
                                <span className='text-muted-foreground'>vs. {range}</span>
                            </div>
                        )}
                    </div>
                    <ChartRangeSelect />
                </div>
                <NetWorthEvolutionChart dataPoints={data ? data.dataPoints : []} />
            </div>
        </Box>
    )
}
