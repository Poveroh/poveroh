'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { expenseCategoriesData } from '../mock-data'

const chartConfig = {
    amount: {
        label: 'Uscite',
        color: 'hsl(var(--chart-3))'
    }
}

export const ExpenseCategoriesBarChart = () => (
    <ChartContainer config={chartConfig} className='h-[260px] w-full'>
        <BarChart data={expenseCategoriesData} layout='vertical' margin={{ left: 16, right: 16, top: 10, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray='3 3' />
            <XAxis type='number' tickLine={false} axisLine={false} />
            <YAxis dataKey='category' type='category' tickLine={false} axisLine={false} width={80} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey='amount' fill='var(--color-amount)' radius={[0, 6, 6, 0]} />
        </BarChart>
    </ChartContainer>
)
