import { useAccount } from '@/hooks/use-account'
import { useCategory } from '@/hooks/use-category'
import { ITransaction, TransactionAction } from '@poveroh/types'

import { useMemo, memo } from 'react'
import icons from 'currency-icons'
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

    // Memoized computations for transaction data
    const transactionData = useMemo(() => {
        if (!transaction.amounts || transaction.amounts.length === 0) {
            return {
                fromAccount: null,
                toAccount: null,
                category: null,
                amount: 0,
                currencySymbol: '',
                isExpense: false
            }
        }

        const firstAmount = transaction.amounts[0]
        if (!firstAmount) {
            return {
                fromAccount: null,
                toAccount: null,
                category: null,
                amount: 0,
                currencySymbol: '',
                isExpense: false
            }
        }

        // Get accounts from cache instead of async calls
        const fromAccount = accountCacheList.find(acc => acc.id === firstAmount.accountId) || null
        const toAccount =
            transaction.type === TransactionAction.INTERNAL && transaction.amounts[1]
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
            amount: firstAmount.amount,
            currencySymbol: icons[firstAmount.currency]?.symbol || '',
            isExpense: firstAmount.action === TransactionAction.EXPENSES
        }
    }, [transaction, accountCacheList, categoryCacheList])

    const { fromAccount, toAccount, category, amount, currencySymbol, isExpense } = transactionData

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='flex items-center justify-center h-[40px] w-[40px]'>
                    {transaction.type === TransactionAction.INTERNAL ? (
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
                        {transaction.type !== TransactionAction.INTERNAL && (
                            <>
                                {isExpense ? (
                                    <p className='danger font-bold'>-</p>
                                ) : (
                                    <p className='success font-bold'>+</p>
                                )}
                            </>
                        )}
                        <h5 className='font-bold'>{amount}</h5>
                        <span>{currencySymbol}</span>
                    </div>
                    <p className='sub'>{category?.title || 'Internal transfer'}</p>
                </div>
                <OptionsPopover<ITransaction>
                    data={transaction}
                    openDelete={openDelete}
                    openEdit={openEdit}
                ></OptionsPopover>
            </div>
        </div>
    )
})
