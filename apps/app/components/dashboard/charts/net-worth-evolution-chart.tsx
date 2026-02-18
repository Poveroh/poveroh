'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, TooltipProps } from 'recharts'
import { ChartContainer, ChartTooltip } from '@poveroh/ui/components/chart'
import { INetWorthEvolutionDataPoint } from '@poveroh/types/dist'
import { TrendingUp, TrendingDown } from 'lucide-react'

type NetWorthEvolutionChartProps = {
    dataPoints: INetWorthEvolutionDataPoint[]
}

const formatCurrency = (value: number) =>
    value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

export const NetWorthEvolutionChart = ({ dataPoints }: NetWorthEvolutionChartProps) => {
    const chartConfig = {
        date: {
            label: 'Data',
            color: 'hsl(var(--chart-1-color))'
        },
        totalNetWorth: {
            label: 'Patrimonio netto totale',
            color: 'hsl(var(--chart-2-color))'
        }
    }
    const chartData = dataPoints.map((point, index) => {
        const previous = index > 0 ? dataPoints[index - 1] : null
        const delta = previous ? point.totalNetWorth - previous.totalNetWorth : 0
        const deltaPct = previous && previous.totalNetWorth !== 0 ? (delta / previous.totalNetWorth) * 100 : 0

        return {
            ...point,
            timestamp: new Date(point.date).getTime(),
            delta,
            deltaPct
        }
    })

    const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (!active || !payload?.length) {
            return null
        }

        const point = payload[0]?.payload as INetWorthEvolutionDataPoint & {
            delta?: number
            deltaPct?: number
        }

        const delta = point?.delta ?? 0
        const deltaPct = point?.deltaPct ?? 0
        const isPositive = delta >= 0
        const deltaSign = isPositive ? '+' : '-'

        return (
            <div className='rounded-xl bg-background px-3 py-2 text-xs shadow-xl'>
                <div className='mb-2 text-muted-foreground'>
                    {new Date(label).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
                <div className='flex items-center gap-3'>
                    <span className={isPositive ? 'text-emerald-500' : 'text-red-500'} aria-hidden='true'>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </span>
                    <span className='text-foreground'>{formatCurrency(point.totalNetWorth)}</span>
                    <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
                        {`${deltaSign}${formatCurrency(Math.abs(delta))} (${deltaSign}${Math.abs(deltaPct).toFixed(1)}%)`}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full min-w-0 justify-start'>
            <LineChart accessibilityLayer data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey='timestamp'
                    type='number'
                    domain={['dataMin', 'dataMax']}
                    scale='time'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={value => {
                        const date = new Date(value)
                        return date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        })
                    }}
                />
                <YAxis
                    width={32}
                    tickMargin={4}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `${value / 1000}k`}
                />
                <ChartTooltip content={renderTooltip} />
                <Line
                    dataKey='totalNetWorth'
                    type='monotone'
                    stroke='var(--chart-2-color)'
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ChartContainer>
    )
}
