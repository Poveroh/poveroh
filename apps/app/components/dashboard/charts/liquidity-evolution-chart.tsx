'use client'

import { Area, AreaChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { liquidityEvolutionData } from '../mock-data'

const chartConfig = {
    total: {
        label: 'Saldo totale',
        color: 'hsl(var(--chart-1))'
    },
    incomeAvg: {
        label: 'Media entrate',
        color: 'hsl(var(--chart-2))'
    }
}

export const LiquidityEvolutionChart = () => (
    <ChartContainer config={chartConfig} className='h-[280px] w-full'>
        <AreaChart data={liquidityEvolutionData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={value => `${value / 1000}k`} />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
                type='monotone'
                dataKey='total'
                stroke='var(--color-total)'
                fill='var(--color-total)'
                fillOpacity={0.2}
                strokeWidth={2}
            />
            <Line type='monotone' dataKey='incomeAvg' stroke='var(--color-incomeAvg)' strokeWidth={2} />
        </AreaChart>
    </ChartContainer>
)
