'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { incomeCategoriesData } from '../mock-data'

const chartConfig = {
    amount: {
        label: 'Entrate',
        color: 'hsl(var(--chart-1))'
    }
}

export const IncomeCategoriesBarChart = () => (
    <ChartContainer config={chartConfig} className='h-[260px] w-full'>
        <BarChart data={incomeCategoriesData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis dataKey='category' tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey='amount' fill='var(--color-amount)' radius={[6, 6, 0, 0]} />
        </BarChart>
    </ChartContainer>
)
