'use client'

import { Line, LineChart, Tooltip, XAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { transactionsSparkline } from '../mock-data'

const chartConfig = {
    value: {
        label: 'Spese giornaliere',
        color: 'hsl(var(--chart-3))'
    }
}

export const TransactionsSparkline = () => (
    <ChartContainer config={chartConfig} className='h-[80px] w-full'>
        <LineChart data={transactionsSparkline} margin={{ left: 4, right: 4, top: 10, bottom: 0 }}>
            <XAxis dataKey='day' hide />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Line type='monotone' dataKey='value' stroke='var(--color-value)' strokeWidth={2} dot={false} />
        </LineChart>
    </ChartContainer>
)
