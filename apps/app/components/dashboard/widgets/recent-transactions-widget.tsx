'use client'

import { useEffect, useState } from 'react'
import Box from '@/components/box/box-wrapper'
import { useTranslations } from 'next-intl'
import BoxHeader from '@/components/box/box-header'
import { Button } from '@poveroh/ui/components/button'
import { PlusIcon } from 'lucide-react'
import { useModal } from '@/hooks/use-modal'
import { TransactionData } from '@poveroh/types'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'
import { useTransaction } from '@/hooks/use-transaction'
import { MODAL_IDS } from '@/types/constant'

export const RecentTransactionsWidget = () => {
    const t = useTranslations()
    const { openModal } = useModal<TransactionData>(MODAL_IDS.TRANSACTION)

    const { fetchTransactions } = useTransaction()
    const [data, setData] = useState<TransactionData[]>([])

    useEffect(() => {
        fetchTransactions(undefined, { skip: 0, take: 5 }).then(result => {
            setData(result?.data ?? [])
        })
    }, [])

    return (
        <>
            <Box noDivide gap={3}>
                <BoxHeader
                    title={t('widget.recent-transactions.title')}
                    sideChildren={
                        <Button
                            size='sm'
                            onClick={() => {
                                openModal('create')
                            }}
                        >
                            <PlusIcon />
                            {t('buttons.add.transaction')}
                        </Button>
                    }
                />
                <div className='flex flex-col divide-y'>
                    {data.length > 0 ? (
                        data.map(transaction => (
                            <TransactionItem
                                compact
                                showOptions={false}
                                key={transaction.id}
                                transaction={transaction}
                                openEdit={item => {
                                    openModal('edit', item)
                                }}
                            />
                        ))
                    ) : (
                        <div className='w-full flex items-center justify-center p-10 sub'>
                            {t('messages.noResults')}
                        </div>
                    )}
                </div>
            </Box>
            <TransactionDialog />
        </>
    )
}
