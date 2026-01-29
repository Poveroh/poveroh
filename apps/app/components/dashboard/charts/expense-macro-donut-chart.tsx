'use client'

import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@poveroh/ui/components/chart'
import { expenseMacroDistribution } from '../mock-data'

const colors = ['#22c55e', '#6366f1', '#f97316', '#06b6d4', '#a855f7', '#facc15']

const chartConfig = expenseMacroDistribution.reduce(
    (acc, item) => {
        acc[item.category] = { label: item.category }
        return acc
    },
    {} as Record<string, { label: string }>
)

export const ExpenseMacroDonutChart = () => (
    <ChartContainer config={chartConfig} className='h-[260px] w-full'>
        <PieChart>
            <Tooltip content={<ChartTooltipContent />} />
            <Pie data={expenseMacroDistribution} dataKey='value' nameKey='category' innerRadius={70} outerRadius={100}>
                {expenseMacroDistribution.map((entry, index) => (
                    <Cell key={entry.category} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey='category' />} />
        </PieChart>
    </ChartContainer>
)
