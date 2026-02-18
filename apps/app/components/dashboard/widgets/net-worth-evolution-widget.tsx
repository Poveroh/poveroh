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
    const { filterDataPoints } = useChartRange()

    useEffect(() => {
        const fetchData = async () => {
            const data = await getNetWorthEvolution()
            setData(data)
        }

        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filteredDataPoints = useMemo(() => {
        return filterDataPoints(data ? data.dataPoints : [])
    }, [data, filterDataPoints])

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
                    </div>
                    <ChartRangeSelect />
                </div>
                <NetWorthEvolutionChart dataPoints={filteredDataPoints} />
            </div>
        </Box>
    )
}
