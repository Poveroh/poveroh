'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { monthComparisonData } from '../mock-data'

const chartConfig = {
    current: {
        label: 'Mese corrente',
        color: 'hsl(var(--chart-1))'
    },
    previous: {
        label: 'Mese precedente',
        color: 'hsl(var(--chart-4))'
    }
}

export const MonthComparisonChart = () => (
    <ChartContainer config={chartConfig} className='h-[260px] w-full'>
        <BarChart data={monthComparisonData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='category' tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey='current' fill='var(--color-current)' radius={[6, 6, 0, 0]} />
            <Bar dataKey='previous' fill='var(--color-previous)' radius={[6, 6, 0, 0]} />
        </BarChart>
    </ChartContainer>
)
