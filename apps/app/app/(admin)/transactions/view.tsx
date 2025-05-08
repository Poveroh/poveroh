'use client'

import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { useTranslations } from 'next-intl'
import { Input } from '@poveroh/ui/components/input'
import { useEffect, useState } from 'react'
import { Download, Landmark, Plus, RotateCcw, Search } from 'lucide-react'
import Box from '@/components/box/boxWrapper'
import { ITransaction } from '@poveroh/types'
import { DeleteModal } from '@/components/modal/delete'
import _ from 'lodash'
import { TransactionDialog } from '@/components/dialog/transactionDialog'
import { useTransaction } from '@/hooks/useTransaction'
import { TransactionItem } from '@/components/item/transaction.item'
import { useCategory } from '@/hooks/useCategory'
import { useBankAccount } from '@/hooks/useBankAccount'

export default function TransactionsView() {
    const t = useTranslations()
    const { transactionCacheList, removeTransaction, fetchTransaction, groupTransactionsByDate } = useTransaction()
    const { fetchCategory } = useCategory()
    const { fetchBankAccount } = useBankAccount()

    const [itemToDelete, setItemToDelete] = useState<ITransaction | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ITransaction | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localTransactionList, setLocalTransactionList] = useState<ITransaction[]>([])

    useEffect(() => {
        fetchTransaction()
        fetchCategory()
        fetchBankAccount()
    }, [])

    useEffect(() => {
        setLocalTransactionList(transactionCacheList)
    }, [transactionCacheList])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (_.isEmpty(textToSearch)) {
            setLocalTransactionList(transactionCacheList)
            return
        }

        const filteredList = transactionCacheList.filter(x => x.title.toLowerCase().includes(textToSearch))

        setLocalTransactionList(filteredList)
    }

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await removeTransaction(itemToDelete.id)

        setLoading(false)

        if (res) {
            setItemToDelete(null)
        }
    }

    return (
        <>
            <div className='space-y-12'>
                <div className='flex flex-row items-end justify-between'>
                    <div className='flex flex-col space-y-3'>
                        <h2>{t('transactions.title')}</h2>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.manage.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('transactions.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchTransaction} />
                        <div className='flex flex-row items-center space-x-3'>
                            <Button variant='outline'>
                                <Download></Download>
                                {t('buttons.export.base')}
                            </Button>
                            <Button onClick={() => setDialogNewOpen(true)}>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-1/3'
                        onChange={onSearch}
                    />
                </div>
                {localTransactionList.length > 0 ? (
                    <>
                        {Object.entries(groupTransactionsByDate(localTransactionList))
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([date, transactions]) => (
                                <div key={date} className='flex flex-col space-y-2'>
                                    <h4>
                                        {(() => {
                                            const currentYear = new Date().getFullYear()
                                            const dateObj = new Date(date)
                                            const isCurrentYear = dateObj.getFullYear() === currentYear

                                            const options: Intl.DateTimeFormatOptions = isCurrentYear
                                                ? { day: 'numeric', month: 'long' }
                                                : { day: 'numeric', month: 'long', year: 'numeric' }

                                            return new Intl.DateTimeFormat('it-IT', options).format(dateObj)
                                        })()}
                                    </h4>
                                    <Box>
                                        <>
                                            {transactions.map(transaction => (
                                                <TransactionItem
                                                    key={transaction.id}
                                                    transaction={transaction}
                                                    openEdit={setItemToEdit}
                                                    openDelete={setItemToDelete}
                                                />
                                            ))}
                                        </>
                                    </Box>
                                </div>
                            ))}
                    </>
                ) : (
                    <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                        <Landmark />
                        <div className='flex flex-col items-center space-y-2 justify-center'>
                            <h4>{t('transactions.empty.title')}</h4>
                            <p>{t('transactions.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            {itemToDelete && (
                <DeleteModal
                    title={itemToDelete.title}
                    description={t('transactions.modal.deleteDescription')}
                    open={true}
                    closeDialog={() => setItemToDelete(null)}
                    loading={loading}
                    onConfirm={onDelete}
                ></DeleteModal>
            )}

            {dialogNewOpen && (
                <TransactionDialog
                    open={dialogNewOpen}
                    inEditingMode={false}
                    dialogHeight='h-[80vh]'
                    closeDialog={() => setDialogNewOpen(false)}
                ></TransactionDialog>
            )}

            {itemToEdit && (
                <TransactionDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    dialogHeight='h-[80vh]'
                    closeDialog={() => setItemToEdit(null)}
                />
            )}
        </>
    )
}
