import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { TransactionApprovalItem } from '../item/transaction-approval-item'
import { useImportTransactions } from '@/hooks/use-import-transactions'

type TransactionsApprovalListProps = {
    importId: string
}

export function TransactionsApprovalList({ importId }: TransactionsApprovalListProps) {
    const t = useTranslations()
    const { transactions, approve, approveAll } = useImportTransactions(importId)

    if (transactions.length === 0) return null

    return (
        <div className='flex flex-col space-y-4 h-full'>
            <div className='flex flex-row items-center justify-between flex-shrink-0'>
                <p>{t('transactions.approvalList.transactionFound', { a: transactions.length })}</p>
                <div className='flex flex-row justify-between space-x-2'>
                    <Button variant='danger' size='sm' onClick={() => approveAll(false)}>
                        {t('transactions.approvalList.rejectAll')}
                    </Button>
                    <Button variant='success' size='sm' onClick={() => approveAll(true)}>
                        {t('transactions.approvalList.approveAll')}
                    </Button>
                </div>
            </div>

            <div className='flex flex-col overflow-y-auto space-y-2 flex-1'>
                {transactions.map((transaction, index) => (
                    <TransactionApprovalItem
                        key={transaction.id}
                        index={index}
                        transaction={transaction}
                        importId={importId}
                        onApprove={approve}
                    />
                ))}
            </div>
        </div>
    )
}
