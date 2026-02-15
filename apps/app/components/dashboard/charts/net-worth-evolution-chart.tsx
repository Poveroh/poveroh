'use client'

import { Area, AreaChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { INetWorthEvolutionDataPoint } from '@poveroh/types/dist'

const chartConfig = {
    date: {
        label: 'Data',
        color: 'hsl(var(--chart-1))'
    },
    totalNetWorth: {
        label: 'Patrimonio netto totale',
        color: 'hsl(var(--chart-2))'
    }
}

type NetWorthEvolutionChartProps = {
    dataPoints: INetWorthEvolutionDataPoint[]
}

export const NetWorthEvolutionChart = ({ dataPoints }: NetWorthEvolutionChartProps) => {
    return (
        <ChartContainer config={chartConfig} className='h-[280px] w-full'>
            <AreaChart data={dataPoints} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='month' tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={value => `${value / 1000}k`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                    type='monotone'
                    dataKey='totalNetWorth'
                    stroke='var(--color-totalNetWorth)'
                    fill='var(--color-totalNetWorth)'
                    fillOpacity={0.2}
                    strokeWidth={2}
                />
                <Line type='monotone' dataKey='date' stroke='var(--color-date)' strokeWidth={2} />
            </AreaChart>
        </ChartContainer>
    )
}
