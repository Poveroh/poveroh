'use client'

import { Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'

type CategoryTrendDatum = {
    month: string
    value: number
    share: number
}

type CategoryTrendChartProps = {
    data: CategoryTrendDatum[]
    mode: 'absolute' | 'share'
}

const chartConfig = {
    value: {
        label: 'Valore',
        color: 'hsl(var(--chart-2))'
    },
    share: {
        label: 'Quota %',
        color: 'hsl(var(--chart-5))'
    }
}

export const CategoryTrendChart = ({ data, mode }: CategoryTrendChartProps) => (
    <ChartContainer config={chartConfig} className='h-[240px] w-full'>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='month' tickLine={false} axisLine={false} />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={value => (mode === 'share' ? `${value}%` : `${value}`)}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
                type='monotone'
                dataKey={mode === 'share' ? 'share' : 'value'}
                stroke={mode === 'share' ? 'var(--color-share)' : 'var(--color-value)'}
                strokeWidth={2}
                dot={{ r: 3 }}
            />
        </LineChart>
    </ChartContainer>
)
