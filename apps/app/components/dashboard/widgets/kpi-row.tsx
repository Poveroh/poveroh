'use client'

import { Card, CardContent } from '@poveroh/ui/components/card'
import { kpiData } from '../mock-data'
import { cn } from '@poveroh/ui/lib/utils'
import { useUtils } from '@/hooks/use-utils'

export const KpiRow = () => {
    const { renderPriceLabel } = useUtils()

    const items = [
        {
            label: 'Totale liquidità',
            value: renderPriceLabel(kpiData.totalLiquidity),
            delta: '+2.4%'
        },
        {
            label: 'Variazione 30 giorni',
            value: renderPriceLabel(kpiData.netChange30d),
            delta: '+8.1%'
        },
        {
            label: 'Cash-flow mese',
            value: renderPriceLabel(kpiData.cashFlowMonth),
            delta: '+4.6%'
        },
        {
            label: 'Spese coperte',
            value: `${kpiData.coveragePct.toFixed(1)}%`,
            delta: 'Target 85%'
        }
    ]

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {items.map(item => (
                <Card key={item.label} className='border-border/60'>
                    <CardContent className='p-4'>
                        <p className='text-sm text-muted-foreground'>{item.label}</p>
                        <div className='mt-2 flex items-end justify-between'>
                            <p className='text-2xl font-semibold'>{item.value}</p>
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    item.delta.startsWith('+') ? 'text-emerald-500' : 'text-muted-foreground'
                                )}
                            >
                                {item.delta}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
