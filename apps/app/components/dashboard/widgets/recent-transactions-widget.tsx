'use client'

import { useEffect } from 'react'
import Box from '@/components/box/box-wrapper'
import { useTranslations } from 'next-intl'
import BoxHeader from '@/components/box/box-header'
import { Button } from '@poveroh/ui/components/button'
import { PlusIcon } from 'lucide-react'
import { useModal } from '@/hooks/use-modal'
import { ITransaction } from '@poveroh/types/dist'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'
import { useTransaction } from '@/hooks/use-transaction'

export const RecentTransactionsWidget = () => {
    const t = useTranslations()
    const { openModal } = useModal<ITransaction>('transaction')

    const { transactionCacheList, fetchTransaction } = useTransaction()

    useEffect(() => {
        fetchTransaction(
            undefined,
            {
                take: 5,
                sortBy: 'date',
                sortOrder: 'desc'
            },
            false,
            true,
            true
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    {transactionCacheList.map(transaction => (
                        <TransactionItem
                            compact
                            showOptions={false}
                            key={transaction.id}
                            transaction={transaction}
                            openEdit={(item: ITransaction) => {
                                openModal('edit', item)
                            }}
                        />
                    ))}
                </div>
            </Box>
            <TransactionDialog></TransactionDialog>
        </>
    )
}
