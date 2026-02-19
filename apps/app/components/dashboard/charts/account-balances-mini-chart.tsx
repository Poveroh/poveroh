'use client'

import { cn } from '@poveroh/ui/lib/utils'

type AccountBalance = {
    id: string
    name: string
    type: string
    balance: number
    delta: number
}

type AccountBalancesMiniChartProps = {
    data: AccountBalance[]
}

const typeColor = (type: string) => {
    if (type === 'BANK_ACCOUNT') return 'bg-emerald-500'
    if (type === 'CREDIT_CARD') return 'bg-orange-500'
    if (type === 'PREPAID_CARD') return 'bg-sky-500'
    return 'bg-muted'
}

export const AccountBalancesMiniChart = ({ data }: AccountBalancesMiniChartProps) => {
    const max = Math.max(...data.map(item => Math.abs(item.balance)), 1)

    return (
        <div className='space-y-4'>
            {data.map(item => (
                <div key={item.id} className='flex items-center gap-4'>
                    <div className='flex-1'>
                        <div className='flex items-center justify-between text-sm font-medium'>
                            <span>{item.name}</span>
                            <span className='tabular-nums'>
                                {item.balance.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                        <div className='mt-2 h-2 w-full rounded-full bg-muted'>
                            <div
                                className={cn('h-2 rounded-full', typeColor(item.type))}
                                style={{ width: `${(Math.abs(item.balance) / max) * 100}%` }}
                            />
                        </div>
                        <p className={cn('mt-1 text-xs', item.delta >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {item.delta >= 0 ? '+' : ''}
                            {item.delta.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })} vs ultimo
                            snapshot
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
