import { useCategory } from '@/hooks/use-category'

import { useEffect, useRef, useState } from 'react'
import icons from 'currency-icons'
import { Pencil, Trash } from 'lucide-react'
import DynamicIcon from '../icon/dynamic-icon'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { useTranslations } from 'next-intl'
import Divider from '../other/divider'
import { TransactionForm } from '../form/transaction-form'
import { Button, buttonVariants } from '@poveroh/ui/components/button'
import { cn } from '@poveroh/ui/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@poveroh/ui/components/alert-dialog'
import { CategoryData, TransactionData, TransactionStatusEnum } from '@poveroh/types'
import { useImportTransactions } from '@/hooks/use-import-transactions'
import type { ImportTransactionDataResponse } from '@poveroh/types'

type TransactionItemProps = {
    transaction: ImportTransactionDataResponse
    index: number
    importId: string
    onApprove: (transactionId: string, newValue: TransactionStatusEnum) => void
}

export function TransactionApprovalItem({ transaction, index, importId, onApprove }: TransactionItemProps) {
    const t = useTranslations()

    const { getCategoryById } = useCategory()
    const { deletePendingTransaction } = useImportTransactions(importId)

    const formRef = useRef<HTMLFormElement | null>(null)

    const isApproved = transaction.status == 'IMPORT_APPROVED' || transaction.status == 'APPROVED'

    const [editingMode, setEditingMode] = useState(false)

    const [category, setCategory] = useState<CategoryData | null>(null)
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
                setIsExpense(firstAmount.action === 'EXPENSES')
            }

            if (transaction.categoryId) {
                setCategory(await getCategoryById(transaction.categoryId))
            }
        }

        fetchData()
    }, [transaction])

    const handleDeleteTransaction = () => deletePendingTransaction.mutateAsync({ path: { id: transaction.id } })

    return (
        <div className='w-full p-5 bg-input rounded-md'>
            {editingMode ? (
                <div className='flex flex-col space-y-4 items-center w-full'>
                    <TransactionForm
                        ref={formRef}
                        initialData={{ ...transaction, importId: null } as TransactionData}
                        inEditingMode={true}
                        inputStyle='outlined'
                        dataCallback={async () => {
                            setEditingMode(false)
                        }}
                    />
                    <Divider />
                    <div className='flex flex-row items-center justify-between w-full'>
                        <AlertDialog>
                            <AlertDialogTrigger className={buttonVariants({ variant: 'danger' })}>
                                <Trash />
                                {t('buttons.delete')}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {t('modal.delete.title', {
                                            a: transaction.title
                                        })}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('transactions.modal.deleteDescription')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                        className={buttonVariants({ variant: 'danger' })}
                                        onClick={handleDeleteTransaction}
                                    >
                                        {t('buttons.delete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <div className='flex flex-row items-center space-x-2'>
                            <Button variant='outline' onClick={() => setEditingMode(false)}>
                                {t('buttons.cancel')}
                            </Button>
                            <Button onClick={() => formRef.current?.submit()}>{t('buttons.save')}</Button>
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
                                    <Pencil size='15' className='cursor-pointer' onClick={() => setEditingMode(true)} />
                                </div>
                                <div className='flex flex-row space-x-2'>
                                    {<p className='sub'>{new Date(transaction.date).toLocaleString()}</p>}
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='flex flex-col space-y-1 items-end'>
                                <div className='flex flex-row space-x-1'>
                                    {transaction.action !== 'TRANSFER' && (
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
                                <p className='sub'>{category?.title || t('messages.noCategoryAssigned')}</p>
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox checked={false} onCheckedChange={() => {}} />
                            <p>{t('form.ignore.label')}</p>
                        </div>
                        <div className='flex flex-row space-x-2'>
                            <Button
                                variant={isApproved ? 'ghost' : 'danger'}
                                size='xs'
                                onClick={() => onApprove(transaction.id, 'IMPORT_REJECTED')}
                            >
                                <DynamicIcon
                                    name='x'
                                    className={cn('h-[20px] w-[20px] cursor-pointer', isApproved ? 'danger' : 'ghost')}
                                />
                            </Button>
                            <Button
                                variant={isApproved ? 'success' : 'ghost'}
                                size='xs'
                                onClick={() => onApprove(transaction.id, 'IMPORT_APPROVED')}
                            >
                                <DynamicIcon
                                    name='check'
                                    className={cn('h-[20px] w-[20px] cursor-pointer', isApproved ? 'ghost' : 'success')}
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
