import { useBankAccount } from '@/hooks/useBankAccount'
import { useCategory } from '@/hooks/useCategory'
import { IBankAccount, ICategory, ITransaction, TransactionAction } from '@poveroh/types'

import { useEffect, useState } from 'react'
import icons from 'currency-icons'
import { ArrowRightLeft } from 'lucide-react'
import { BrandIcon } from '../icon/BrandIcon'
import DynamicIcon from '../icon/DynamicIcon'

type TransactionItemProps = {
    transaction: ITransaction
    openDelete: (item: ITransaction) => void
    openEdit: (item: ITransaction) => void
}

export function TransactionItem({ transaction, openDelete, openEdit }: TransactionItemProps) {
    const { getCategory } = useCategory()
    const { getBankAccount } = useBankAccount()

    const [fromAccount, setFromAccount] = useState<IBankAccount | null>(null)
    const [toAccount, setToAccount] = useState<IBankAccount | null>(null)
    const [category, setCategory] = useState<ICategory | null>(null)
    const [amount, setAmount] = useState<number>(0)
    const [currencySymbol, setCurrencySymbol] = useState('')
    const [isExpense, setIsExpense] = useState(false)

    useEffect(() => {
        async function fetchData() {
            // if (transaction.amounts && transaction.amounts.length > 0) {
            //     const firstAmount = transaction.amounts[0]
            //     if (!firstAmount) return
            //     setAmount(firstAmount.amount)
            //     setCurrencySymbol(icons[firstAmount.currency]?.symbol || '')
            //     setIsExpense(firstAmount.action === TransactionAction.EXPENSES)
            //     setFromAccount(await getBankAccount(firstAmount.bankAccountId))
            //     if (transaction.type === TransactionAction.INTERNAL && transaction.amounts[1]) {
            //         setToAccount(await getBankAccount(transaction.amounts[1].bankAccountId))
            //     }
            // }
            // if (transaction.categoryId) {
            //     setCategory(await getCategory(transaction.categoryId))
            // }
        }

        fetchData()
    }, [transaction, getBankAccount, getCategory])

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='flex items-center justify-center h-[40px] w-[40px]'>
                    {(() => {
                        if (transaction.type === TransactionAction.INTERNAL) {
                            return <ArrowRightLeft />
                        } else if (transaction.icon) {
                            return <BrandIcon icon={transaction.icon} />
                        } else {
                            return <DynamicIcon name={category?.logoIcon || 'landmark'} className='h-[30px] w-[30px]' />
                        }
                    })()}
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
            <div className='flex flex-col items-center'>
                <div className='flex flex-col space-y-1 items-end'>
                    <div className='flex flex-row space-x-1'>
                        {transaction.type !== TransactionAction.INTERNAL && (
                            <>
                                {isExpense && <p className='danger font-bold'>-</p>}
                                {!isExpense && <p className='success font-bold'>+</p>}
                            </>
                        )}
                        <h5 className='font-bold'>{amount}</h5>
                        <span>{currencySymbol}</span>
                    </div>
                    <p className='sub'>{category?.title || 'Internal transfer'}</p>
                </div>
            </div>
        </div>
    )
}
