'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, TooltipProps } from 'recharts'
import { ChartContainer, ChartTooltip } from '@poveroh/ui/components/chart'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import Box from '@/components/box/box-wrapper'
import { useTranslations } from 'next-intl'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AccountVariation, ChartRange, FinancialAccountBalanceData } from '@poveroh/types'
import { useConfig } from '@/hooks/use-config'
import { ChartRangeOption } from '@/lib/chart-range'

type AccountBalanceCardProps = {
    currentBalance: number
    variation: AccountVariation | null
    dataPoints: FinancialAccountBalanceData[]
    range: ChartRange
    options: ChartRangeOption[]
    onRangeChange: (range: ChartRange) => void
}

export function AccountBalanceCard({
    currentBalance,
    variation,
    dataPoints,
    range,
    options,
    onRangeChange
}: AccountBalanceCardProps) {
    const t = useTranslations()
    const { preferedCurrency, preferedLanguage } = useConfig()

    const formatCurrency = (value: number) =>
        value.toLocaleString(preferedLanguage, { style: 'currency', currency: preferedCurrency })

    const chartConfig = {
        balance: {
            label: t('accounts.detail.balance.label'),
            color: 'hsl(var(--chart-2-color))'
        }
    }

    const chartData = dataPoints.map((point, index) => {
        const previous = index > 0 ? dataPoints[index - 1] : null
        const delta = previous ? point.balance - previous.balance : 0
        const deltaPct = previous && previous.balance !== 0 ? (delta / previous.balance) * 100 : 0

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

        const point = payload[0]?.payload as FinancialAccountBalanceData & { delta?: number; deltaPct?: number }
        const delta = point?.delta ?? 0
        const deltaPct = point?.deltaPct ?? 0
        const isPositive = delta >= 0
        const deltaSign = isPositive ? '+' : '-'

        return (
            <div className='rounded-xl bg-background px-3 py-2 text-xs shadow-xl'>
                <div className='mb-2 text-muted-foreground'>
                    {new Date(label).toLocaleDateString(preferedLanguage, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
                <div className='flex items-center gap-3'>
                    <span className={isPositive ? 'text-emerald-500' : 'text-red-500'} aria-hidden='true'>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </span>
                    <span className='text-foreground'>{formatCurrency(point.balance)}</span>
                    {delta !== 0 && (
                        <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
                            {`${deltaSign}${formatCurrency(Math.abs(delta))} (${deltaSign}${Math.abs(deltaPct).toFixed(
                                1
                            )}%)`}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <Box>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-6'>
                            <p className='sub uppercase'>{t('accounts.detail.balance.label')}</p>
                            <div className='flex flex-row items-center gap-2'>
                                <span className='dot bg-success'></span>
                                <p className='success uppercase'>{t('accounts.detail.balance.live')}</p>
                            </div>
                        </div>
                        <h2>{formatCurrency(currentBalance)}</h2>
                        {variation && variation.delta !== 0 && (
                            <div className='flex items-center gap-2 text-sm'>
                                <span
                                    className={`flex items-center gap-1 ${
                                        variation.isPositive ? 'text-emerald-500' : 'text-red-500'
                                    }`}
                                >
                                    {variation.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {`${variation.isPositive ? '+' : '-'}${formatCurrency(Math.abs(variation.delta))} (${
                                        variation.isPositive ? '+' : '-'
                                    }${Math.abs(variation.deltaPct).toFixed(1)}%)`}
                                </span>
                            </div>
                        )}
                    </div>

                    <Tabs value={range} onValueChange={value => onRangeChange(value as ChartRange)} className='w-fit'>
                        <TabsList>
                            {options.map(option => (
                                <TabsTrigger key={option.value} value={option.value}>
                                    {option.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {chartData.length === 0 ? (
                    <div className='flex items-center justify-center h-[250px] text-muted-foreground'>
                        <p>{t('accounts.detail.chart.empty')}</p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full min-w-0 justify-start'>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} stroke='var(--hr-color)' />
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
                                    return date.toLocaleDateString(preferedLanguage, { month: 'short', day: 'numeric' })
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
                                dataKey='balance'
                                type='monotone'
                                stroke='var(--chart-2-color)'
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </div>
        </Box>
    )
}
