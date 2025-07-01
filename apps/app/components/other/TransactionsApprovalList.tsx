import { ITransaction } from '@poveroh/types/dist'
import { Button } from '@poveroh/ui/components/button'
import { useTranslations } from 'next-intl'
import { TransactionApprovalItem } from '../item/TransactionApprovalItem'

type TransactionsApprovalListProps = {
    transactions: ITransaction[]
}

export function TransactionsApprovalList({ transactions }: TransactionsApprovalListProps) {
    const t = useTranslations()

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex flex-row items-center justify-between'>
                <p>{t('transactions.approvalList.transactionFound', { a: transactions.length })}</p>
                <div className='flex flex-row justify-between space-x-2'>
                    <Button variant='danger' size='sm'>
                        {t('transactions.approvalList.rejectAll')}
                    </Button>
                    <Button variant='success' size='sm'>
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
                            openDelete={(item: ITransaction) => {}}
                            openEdit={(item: ITransaction) => {}}
                        ></TransactionApprovalItem>
                    )
                })}
            </div>
        </div>
    )
}
