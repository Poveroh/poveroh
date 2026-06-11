'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import moment from 'moment-timezone'

import Box from '@/components/box/box-wrapper'
import { TransactionItem } from '@/components/item/transaction-item'
import SkeletonItem from '@/components/skeleton/skeleton-item'

import { useTransaction } from '@/hooks/use-transaction'
import { useTransactionPagination } from '@/hooks/use-transaction-pagination'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useConfig } from '@/hooks/use-config'

import { MODAL_IDS } from '@/types/constant'
import { TransactionData } from '@poveroh/types'

type AccountTransactionsSectionProps = {
    accountId: string
}

export function AccountTransactionsSection({ accountId }: AccountTransactionsSectionProps) {
    const t = useTranslations()
    const sectionRef = useRef<HTMLDivElement | null>(null)

    const { groupTransactionsByDate } = useTransaction()
    const { preferedLanguage } = useConfig()

    const { openModal } = useModal<TransactionData>(MODAL_IDS.TRANSACTION)
    const { openModal: openDeleteModal } = useDeleteModal<TransactionData>()

    const activeFilters = useMemo(() => ({ financialAccountId: accountId }), [accountId])

    const { transactions, isLoading, isLoadingMore, bindInfiniteScroll } = useTransactionPagination({ activeFilters })

    useEffect(() => {
        return bindInfiniteScroll(sectionRef)
    }, [bindInfiniteScroll])

    const listContent = useMemo(() => {
        if (transactions.length === 0) return null

        return Object.entries(groupTransactionsByDate(transactions))
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, dayTransactions]) => {
                const currentYear = moment().year()
                const dateMoment = moment(date)
                const isCurrentYear = dateMoment.year() === currentYear
                const dateLabel = (
                    isCurrentYear ? dateMoment.format('D MMMM') : dateMoment.format('D MMMM YYYY')
                ).toLocaleLowerCase(preferedLanguage)

                return (
                    <div key={date} className='flex flex-col space-y-2'>
                        <h4>{dateLabel}</h4>
                        <Box>
                            {dayTransactions.map(transaction => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    openEdit={(item: TransactionData) => openModal('edit', item)}
                                    openDelete={openDeleteModal}
                                />
                            ))}
                        </Box>
                    </div>
                )
            })
    }, [transactions, preferedLanguage])

    return (
        <div ref={sectionRef} className='flex flex-col space-y-4 w-full'>
            {isLoading && transactions.length === 0 ? (
                <SkeletonItem repeat={5} />
            ) : transactions.length === 0 ? (
                <div className='flex flex-col items-center space-y-2 justify-center h-[200px] text-center'>
                    <p className='text-muted-foreground'>{t('accounts.detail.transactions.empty')}</p>
                </div>
            ) : (
                <>
                    {listContent}
                    {isLoadingMore && (
                        <div className='flex justify-center items-center w-full py-4'>
                            <p className='text-muted-foreground'>{t('messages.loading')}...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
