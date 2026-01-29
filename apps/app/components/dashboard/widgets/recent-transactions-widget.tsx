'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@poveroh/ui/components/card'
import { Button } from '@poveroh/ui/components/button'
import { cn } from '@poveroh/ui/lib/utils'
import { recentTransactions } from '../mock-data'
import { TransactionsSparkline } from '../charts/transactions-sparkline'

type FilterType = 'ALL' | 'INCOME' | 'EXPENSES'

export const RecentTransactionsWidget = () => {
    const [filter, setFilter] = useState<FilterType>('ALL')

    const data = useMemo(() => {
        if (filter === 'ALL') return recentTransactions
        return recentTransactions.filter(item => item.type === filter)
    }, [filter])

    return (
        <Card className='h-full'>
            <CardHeader>
                <CardTitle>Transazioni recenti</CardTitle>
                <CardDescription>Ultimi 30 giorni con sparkline.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='mb-4'>
                    <TransactionsSparkline />
                </div>
                <div className='flex flex-wrap gap-2 pb-4'>
                    {(['ALL', 'EXPENSES', 'INCOME'] as const).map(item => (
                        <Button
                            key={item}
                            type='button'
                            variant={filter === item ? 'default' : 'ghost'}
                            size='sm'
                            onClick={() => setFilter(item)}
                        >
                            {item === 'ALL' ? 'Tutte' : item === 'INCOME' ? 'Entrate' : 'Uscite'}
                        </Button>
                    ))}
                </div>
                <div className='space-y-3'>
                    {data.slice(0, 15).map(item => (
                        <div
                            key={item.id}
                            className='flex items-center justify-between rounded-md border border-border/50 px-3 py-2'
                        >
                            <div>
                                <p className='text-sm font-medium'>{item.title}</p>
                                <p className='text-xs text-muted-foreground'>{item.date}</p>
                            </div>
                            <span
                                className={cn(
                                    'text-sm font-semibold tabular-nums',
                                    item.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                )}
                            >
                                {item.amount >= 0 ? '+' : ''}
                                {item.amount.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
