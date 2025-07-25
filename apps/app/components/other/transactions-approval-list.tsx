import { TransactionStatus, ITransaction } from '@poveroh/types'
import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { TransactionApprovalItem } from '../item/transaction-approval-item'
import { useEffect, useState } from 'react'
import logger from '@/lib/logger'
import { cloneDeep } from 'lodash'
import { useImport } from '@/hooks/use-imports'

type TransactionsApprovalListProps = {
    transactions: ITransaction[]
}

export function TransactionsApprovalList({ transactions }: TransactionsApprovalListProps) {
    const t = useTranslations()

    const [localTransactions, setLocalTransactions] = useState<ITransaction[]>(transactions)

    const { editPendingTransaction } = useImport()

    useEffect(() => {
        setLocalTransactions(transactions)
    }, [transactions])

    const handleApproveTransaction = async (transactionId: string, newValue: TransactionStatus) => {
        logger.debug('Toggle approve transaction:', transactionId)

        const clonedTransactions = cloneDeep(localTransactions)
        const transaction = localTransactions.find(t => t.id === transactionId)

        if (!transaction) {
            logger.error('Transaction not found:', transactionId)
            return
        }

        if (transaction.status === newValue) return

        transaction.status = newValue

        const formData = new FormData()
        formData.append('data', JSON.stringify([transaction]))

        editPendingTransaction(transactionId, formData)

        clonedTransactions[clonedTransactions.findIndex(t => t.id === transactionId)] = transaction

        setLocalTransactions(clonedTransactions)
    }

    const handleAllApproveTransactions = (approveAll: boolean) => {
        logger.debug('Handle all transactions approval:', approveAll)

        const clonedTransactions = cloneDeep(localTransactions)

        if (clonedTransactions.length === 0) {
            logger.debug('No transactions to approve or reject')
            return
        }

        logger.debug(`Setting all transactions to ${approveAll ? 'approved' : 'rejected'}`)

        const newTransactionStatus = approveAll ? TransactionStatus.IMPORT_APPROVED : TransactionStatus.IMPORT_REJECTED

        clonedTransactions.forEach(item => {
            item.status = newTransactionStatus
        })

        const formData = new FormData()
        formData.append('data', JSON.stringify(clonedTransactions))

        editPendingTransaction('', formData)

        setLocalTransactions(clonedTransactions)
    }

    const handleEditTransaction = (transaction: ITransaction) => {
        logger.debug('Edit transaction:', transaction)

        const clonedTransactions = cloneDeep(localTransactions)
        const index = clonedTransactions.findIndex(t => t.id === transaction.id)
        if (index !== -1) {
            clonedTransactions[index] = transaction
            setLocalTransactions(clonedTransactions)
        }
    }

    const handleDeleteTransaction = (transactionId: string) => {
        logger.debug('Delete transaction:', transactionId)

        const clonedTransactions = cloneDeep(localTransactions)
        const index = clonedTransactions.findIndex(t => t.id === transactionId)
        if (index !== -1) {
            clonedTransactions.splice(index, 1)
            setLocalTransactions(clonedTransactions)
        }
    }

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex flex-row items-center justify-between'>
                <p>{t('transactions.approvalList.transactionFound', { a: localTransactions.length })}</p>
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
                {localTransactions.map((transaction, index) => {
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
