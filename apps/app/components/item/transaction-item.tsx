import { useAccount } from '@/hooks/use-account'
import { useCategory } from '@/hooks/use-category'
import { ITransaction, TransactionAction } from '@poveroh/types'

import { useMemo, memo, useRef } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { BrandIcon } from '../icon/brand-icon'
import DynamicIcon from '../icon/dynamic-icon'
import { OptionsPopover } from '../navbar/options-popover'

type TransactionItemProps = {
    transaction: ITransaction
    openDelete: (item: ITransaction) => void
    openEdit: (item: ITransaction) => void
}

export const TransactionItem = memo(function TransactionItem({
    transaction,
    openDelete,
    openEdit
}: TransactionItemProps) {
    const { accountCacheList } = useAccount()
    const { categoryCacheList } = useCategory()

    const isClickingRef = useRef(false)

    // Memoized computations for transaction data
    const transactionData = useMemo(() => {
        const defaultValues = {
            fromAccount: null,
            toAccount: null,
            category: null,
            amount: 0,
            currencySymbol: '',
            isExpense: false
        }

        if (!transaction.amounts || transaction.amounts.length === 0) return defaultValues

        let amount = { ...transaction.amounts[0] }

        if (transaction.action === TransactionAction.EXPENSES) {
            amount = { ...amount, amount: transaction.amounts.reduce((acc, curr) => acc + (curr.amount || 0), 0) }
        } else {
            if (!amount) return defaultValues
        }

        // Get accounts from cache instead of async calls
        const fromAccount = accountCacheList.find(acc => acc.id === amount.accountId) || null
        const toAccount =
            transaction.action === TransactionAction.TRANSFER && transaction.amounts[1]
                ? accountCacheList.find(acc => acc.id === transaction.amounts[1]!.accountId) || null
                : null

        // Get category from cache instead of async calls
        const category = transaction.categoryId
            ? categoryCacheList.find(cat => cat.id === transaction.categoryId) || null
            : null

        return {
            fromAccount,
            toAccount,
            category,
            amount: amount.amount || 0,
            // currencySymbol: icons[amount.currency]?.symbol || '',
            isExpense: transaction.action === TransactionAction.EXPENSES
        }
    }, [transaction, accountCacheList, categoryCacheList])

    const { fromAccount, toAccount, category, amount, isExpense } = transactionData

    const handleClick = () => {
        if (isClickingRef.current) return
        isClickingRef.current = true
        openEdit(transaction)
        setTimeout(() => {
            isClickingRef.current = false
        }, 300)
    }

    return (
        <div
            className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer'
            onClick={handleClick}
        >
            <div className='flex flex-row items-center space-x-5'>
                <div className='flex items-center justify-center h-[40px] w-[40px]'>
                    {transaction.action === TransactionAction.TRANSFER ? (
                        <ArrowRightLeft />
                    ) : transaction.icon ? (
                        <BrandIcon icon={transaction.icon} />
                    ) : (
                        <DynamicIcon name={category?.logoIcon || 'landmark'} className='h-[30px] w-[30px]' />
                    )}
                </div>

                <div className='flex flex-col space-y-1'>
                    <p>{transaction.title}</p>

                    <div className='flex flex-row space-x-2'>
                        <p className='sub'>{fromAccount?.title}</p>
                        {toAccount && (
                            <>
                                <DynamicIcon name='move-right' className='h-[20px] w-[20px] sub' />
                                <p className='sub'>{toAccount.title}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center space-x-6'>
                <div className='flex flex-col space-y-1 items-end'>
                    <div className='flex flex-row space-x-1'>
                        {transaction.action !== TransactionAction.TRANSFER && (
                            <>
                                {isExpense ? (
                                    <p className='danger font-bold'>-</p>
                                ) : (
                                    <p className='success font-bold'>+</p>
                                )}
                            </>
                        )}
                        <h5 className='font-bold'>{amount}</h5>
                        {/* <span>{currencySymbol}</span> */}
                    </div>
                    <p className='sub'>{category?.title || 'Internal transfer'}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <OptionsPopover<ITransaction> data={transaction} openDelete={openDelete} openEdit={openEdit} />
                </div>
            </div>
        </div>
    )
})
