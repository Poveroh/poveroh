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
        importStore
    } = useImport()

    if (importStore.pendingTransactions.length === 0) {
        return null
    }

    return (
        <div className='flex flex-col space-y-4 h-full'>
            <div className='flex flex-row items-center justify-between flex-shrink-0'>
                <p>{t('transactions.approvalList.transactionFound', { a: importStore.pendingTransactions.length })}</p>
                <div className='flex flex-row justify-between space-x-2'>
                    <Button variant='danger' size='sm' onClick={() => handleAllApproveTransactions(false)}>
                        {t('transactions.approvalList.rejectAll')}
                    </Button>
                    <Button variant='success' size='sm' onClick={() => handleAllApproveTransactions(true)}>
                        {t('transactions.approvalList.approveAll')}
                    </Button>
                </div>
            </div>

            <div className='flex flex-col overflow-y-auto space-y-2 flex-1'>
                {importStore.pendingTransactions.map((transaction, index) => {
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
