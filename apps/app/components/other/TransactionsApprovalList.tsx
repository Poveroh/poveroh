import { ITransaction } from '@poveroh/types'
import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { TransactionApprovalItem } from '../item/TransactionApprovalItem'
import { use, useEffect, useState } from 'react'
import logger from '@/lib/logger'

type TransactionsApprovalListProps = {
    transactions: ITransaction[]
}

export function TransactionsApprovalList({ transactions }: TransactionsApprovalListProps) {
    const t = useTranslations()

    const [localTransactions, setLocalTransactions] = useState<ITransaction[]>(transactions)

    const [approvedTransactions, setApprovedTransactions] = useState<string[]>([])

    useEffect(() => {
        setLocalTransactions(transactions)
    }, [transactions])

    useEffect(() => {
        logger.debug('Approved Transactions:', approvedTransactions)
    }, [approvedTransactions])

    const handleApproveTransaction = (transactionId: string) => {
        setApprovedTransactions(prev =>
            prev.includes(transactionId) ? prev.filter(id => id !== transactionId) : [...prev, transactionId]
        )
    }

    const handleAllApprovedTransactions = (approveAll: boolean) => {
        if (approveAll && approvedTransactions.length === transactions.length) return

        setApprovedTransactions(approveAll ? localTransactions.map(t => t.id) : [])
    }

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex flex-row items-center justify-between'>
                <p>{t('transactions.approvalList.transactionFound', { a: transactions.length })}</p>
                <div className='flex flex-row justify-between space-x-2'>
                    <Button variant='danger' size='sm' onClick={() => handleAllApprovedTransactions(false)}>
                        {t('transactions.approvalList.rejectAll')}
                    </Button>
                    <Button variant='success' size='sm' onClick={() => handleAllApprovedTransactions(true)}>
                        {t('transactions.approvalList.approveAll')}
                    </Button>
                </div>
            </div>

            <div className='flex flex-col space-y-2'>
                {transactions.map((transaction, index) => {
                    return (
                        <TransactionApprovalItem
                            key={transaction.id}
                            index={index}
                            transaction={transaction}
                            isApproved={approvedTransactions.includes(transaction.id)}
                            onApprove={handleApproveTransaction}
                            openDelete={(item: ITransaction) => {}}
                            openEdit={(item: ITransaction) => {}}
                        ></TransactionApprovalItem>
                    )
                })}
            </div>
        </div>
    )
}
