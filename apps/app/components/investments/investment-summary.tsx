import { useMemo } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { formatCurrency, YEAR_FILTERS } from '@/components/investments/investment-utils'
import type { InvestmentSummaryLabels } from '@/components/investments/investment-utils'

function InvestmentChart({ value }: { value: number }) {
    const points = useMemo(() => {
        const seed = Math.max(1, Math.round(value / 1000))
        return Array.from({ length: 64 }, (_, index) => {
            const wave = Math.sin(index * 0.7) * 22 + Math.cos(index * 1.35 + seed) * 17
            const jitter = ((index * 19 + seed) % 31) - 15
            return 52 + wave + jitter
        })
    }, [value])

    const path = points
        .map((point, index) => {
            const x = (index / (points.length - 1)) * 1000
            const y = 150 - Math.max(10, Math.min(138, point))
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
        })
        .join(' ')

    return (
        <svg viewBox='0 0 1000 170' className='h-52 w-full overflow-visible'>
            <path
                d={path}
                fill='none'
                stroke='var(--success-color)'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <g className='text-muted-foreground'>
                {['Apr 6', 'Apr 16', 'Apr 28', 'May 9', 'May 21', 'Jun 2', 'Jun 12', 'Jun 24'].map((label, index) => (
                    <text key={label} x={40 + index * 130} y='166' fill='currentColor' fontSize='14'>
                        {label}
                    </text>
                ))}
            </g>
        </svg>
    )
}

export function InvestmentSummary({
    totalValue,
    liveAssets,
    year,
    onYearChange,
    labels
}: {
    totalValue: number
    liveAssets: number
    year: string
    onYearChange: (year: string) => void
    labels: InvestmentSummaryLabels
}) {
    return (
        <section className='rounded-lg bg-box p-8'>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-2'>
                            <p className='uppercase text-muted-foreground'>{labels.balance}</p>
                            {liveAssets > 0 && (
                                <span className='flex items-center gap-1 text-xs font-semibold text-success'>
                                    <span className='h-2 w-2 rounded-full bg-success' />
                                    {labels.live}
                                </span>
                            )}
                        </div>
                        <div className='flex flex-wrap items-end gap-6'>
                            <h2>{formatCurrency(totalValue)}</h2>
                            <p className='pb-2 text-success'>
                                + {formatCurrency(Math.max(totalValue * 0.013, 0))} (1,05 %)
                            </p>
                        </div>
                    </div>
                    <Tabs value={year} onValueChange={onYearChange} className='w-full max-w-[320px]'>
                        <TabsList className='grid w-full grid-cols-3'>
                            {YEAR_FILTERS.map(item => (
                                <TabsTrigger key={item} value={item}>
                                    {item}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                <InvestmentChart value={totalValue + Number(year)} />
            </div>
        </section>
    )
}
