'use client'

import { formatNumber } from '@/lib/format'
import { useTranslations } from 'next-intl'
import { useBalance } from '@/hooks/use-balance'
import { Skeleton } from '@poveroh/ui/components/skeleton'

type StatProps = {
    label: string
    amount: number
    changePct: number
    positive: boolean
    locale?: string
}

function Triangle({ up, color }: { up: boolean; color: string }) {
    return (
        <svg aria-hidden width='18' height='18' viewBox='0 0 24 24' className={up ? '' : 'rotate-180'} fill={color}>
            <path d='M12 3l10 18H2z' />
        </svg>
    )
}

function Stat({ label, amount, changePct, positive, locale = 'it-IT' }: StatProps) {
    const prefix = positive ? '+' : '-'
    const color = positive ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
    const textColor = positive ? 'text-green-500' : 'text-red-500'

    return (
        <div className='flex flex-col gap-1'>
            <p className='sub uppercase'>{label}</p>
            <div className='flex flex-row items-center gap-3'>
                <Triangle up={positive} color={color} />
                <p className={`font-medium ${textColor}`}>
                    {prefix}
                    {formatNumber(Math.abs(amount), locale)} (
                    <span className={textColor}>{formatNumber(Math.abs(changePct), locale)}</span>
                    %)
                </p>
            </div>
        </div>
    )
}

export function NetWorthWidget() {
    const t = useTranslations('dashboard')
    const { balance, reports, loading, fetchBalance } = useBalance()

    const locale = 'it-IT'

    const totalBalance = balance?.totalBalance ?? 0
    const totalIncome = reports?.totalIncome ?? 0
    const totalExpense = reports?.totalExpense ?? 0

    //mock
    const incomeChangePct = 1.05
    const expensesChangePct = 0.05

    return (
        <div className='flex flex-row justify-between'>
            <div className='flex flex-col'>
                <p className='sub uppercase'>{t('totalBalance')}</p>
                <div className='flex flex-row gap-8 items-center'>
                    {loading ? (
                        <Skeleton className='h-8 w-24' />
                    ) : (
                        <h1 className='font-bold'>{formatNumber(totalBalance, locale)}</h1>
                    )}
                    {reports && (
                        <>
                            <Stat
                                label={t('income')}
                                amount={totalIncome}
                                changePct={incomeChangePct}
                                positive={true}
                                locale={locale}
                            />
                            <Stat
                                label={t('expenses')}
                                amount={totalExpense}
                                changePct={expensesChangePct}
                                positive={false}
                                locale={locale}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
