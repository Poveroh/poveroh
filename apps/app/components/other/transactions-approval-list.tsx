import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { TransactionApprovalItem } from '../item/transaction-approval-item'
import { useImport } from '@/hooks/use-imports'

export function TransactionsApprovalList() {
    const t = useTranslations()

    const {
        handleAllApproveTransactions,
        handleApproveTransaction,
        handleDeleteTransaction,
        handleEditTransaction,
        pendingTransactions
    } = useImport()

    if (pendingTransactions.length === 0) {
        return null
    }

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex flex-row items-center justify-between'>
                <p>{t('transactions.approvalList.transactionFound', { a: pendingTransactions.length })}</p>
                <div className='flex flex-row justify-between space-x-2'>
                    <Button variant='danger' size='sm' onClick={() => handleAllApproveTransactions(false)}>
                        {t('transactions.approvalList.rejectAll')}
                    </Button>
                    <Button variant='success' size='sm' onClick={() => handleAllApproveTransactions(true)}>
                        {t('transactions.approvalList.approveAll')}
                    </Button>
                </div>
            </div>

            <div className='flex flex-col space-y-2'>
                {pendingTransactions.map((transaction, index) => {
                    return (
                        <TransactionApprovalItem
                            key={transaction.id}
                            index={index}
                            transaction={transaction}
                            onApprove={handleApproveTransaction}
                            onDelete={handleDeleteTransaction}
                            onEdit={handleEditTransaction}
                        ></TransactionApprovalItem>
                    )
                })}
            </div>
        </div>
    )
}
