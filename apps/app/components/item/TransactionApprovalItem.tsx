import { useBankAccount } from '@/hooks/useBankAccount'
import { useCategory } from '@/hooks/useCategory'
import { IBankAccount, ICategory, ITransaction, TransactionAction } from '@poveroh/types'

import { useEffect, useRef, useState } from 'react'
import icons from 'currency-icons'
import { Pencil, Trash } from 'lucide-react'
import DynamicIcon from '../icon/DynamicIcon'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { useTranslations } from 'next-intl'
import Divider from '../other/Divider'
import { TransactionForm } from '../form/TransactionForm'
import { Button } from '@poveroh/ui/components/button'

type TransactionItemProps = {
    transaction: ITransaction
    index: number
    openDelete: (item: ITransaction) => void
    openEdit: (item: ITransaction) => void
}

export function TransactionApprovalItem({ transaction, index, openDelete, openEdit }: TransactionItemProps) {
    const t = useTranslations()

    const { getCategory } = useCategory()
    const { getBankAccount } = useBankAccount()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [editingMode, setEditingMode] = useState(false)

    const [fromAccount, setFromAccount] = useState<IBankAccount | null>(null)
    const [toAccount, setToAccount] = useState<IBankAccount | null>(null)
    const [category, setCategory] = useState<ICategory | null>(null)
    const [amount, setAmount] = useState<number>(0)
    const [currencySymbol, setCurrencySymbol] = useState('')
    const [isExpense, setIsExpense] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (transaction.amounts && transaction.amounts.length > 0) {
                const firstAmount = transaction.amounts[0]

                if (!firstAmount) return

                setAmount(firstAmount.amount)
                setCurrencySymbol(icons[firstAmount.currency]?.symbol || '')
                setIsExpense(firstAmount.action === TransactionAction.EXPENSES)
                setFromAccount(await getBankAccount(firstAmount.bank_account_id))

                if (transaction.type === TransactionAction.INTERNAL && transaction.amounts[1]) {
                    setToAccount(await getBankAccount(transaction.amounts[1].bank_account_id))
                }
            }

            if (transaction.category_id) {
                setCategory(await getCategory(transaction.category_id))
            }
        }

        fetchData()
    }, [transaction, getBankAccount, getCategory])

    return (
        <div className='w-full p-5 bg-input rounded-md'>
            {editingMode ? (
                <div className='flex flex-col space-y-4 items-center w-full'>
                    <TransactionForm
                        ref={formRef}
                        initialData={transaction}
                        mode='edit'
                        inputStyle='outlined'
                        action={transaction.type}
                        handleSubmit={async (data: FormData) => {}}
                    ></TransactionForm>
                    <Divider></Divider>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <Button
                            variant='danger'
                            onClick={() => {
                                // setEditingMode(false)
                                // openDelete(transaction)
                            }}
                        >
                            <Trash />
                            {t('buttons.delete')}
                        </Button>
                        <div className='flex flex-row items-center space-x-2'>
                            <Button
                                variant='outline'
                                onClick={async () => {
                                    setEditingMode(false)
                                    // openEdit(transaction)
                                }}
                            >
                                {t('buttons.cancel')}
                            </Button>
                            <Button
                                onClick={async () => {
                                    // setEditingMode(false)
                                    // openEdit(transaction)
                                }}
                            >
                                {t('buttons.save')}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col space-y-2 items-center w-full'>
                    <div className='flex flex-row justify-between items-center w-full'>
                        <div className='flex flex-row items-start space-x-5'>
                            <div className='bg-white flex items-center justify-center h-[30px] w-[30px] text-black font-bold'>
                                {index + 1}
                            </div>
                            <div className='flex flex-col space-y-1'>
                                <div className='flex flex-row space-x-2 items-center'>
                                    <p>{transaction.title}</p>
                                    <Pencil
                                        size='15'
                                        className='cursor-pointer'
                                        onClick={() => setEditingMode(true)}
                                    ></Pencil>
                                </div>
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
                        </div>
                    </div>
                    <Divider></Divider>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox checked={false} onCheckedChange={() => {}} />
                            <p>{t('form.ignore.label')}</p>
                        </div>
                        <div className='flex flex-row space-x-2'>
                            <DynamicIcon name='x' className='h-[20px] w-[20px] cursor-pointer danger' />
                            <DynamicIcon name='check' className='h-[20px] w-[20px] cursor-pointer success' />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
