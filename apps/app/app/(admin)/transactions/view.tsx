'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { Input } from '@poveroh/ui/components/input'

import { ArrowLeftRight, Download, Plus, RotateCcw, Search, Upload } from 'lucide-react'

import Box from '@/components/box/BoxWrapper'
import { DeleteModal } from '@/components/modal/DeleteModal'
import { TransactionDialog } from '@/components/dialog/TransactionDialog'
import { TransactionItem } from '@/components/item/TransactionItem'

import { useTransaction } from '@/hooks/useTransaction'
import { useCategory } from '@/hooks/useCategory'
import { useBankAccount } from '@/hooks/useBankAccount'

import { IFilterOptions, ITransaction } from '@poveroh/types'

import { isEmpty } from 'lodash'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import Divider from '@/components/other/Divider'
import { ImportDialog } from '@/components/dialog/ImportDialog'

export default function TransactionsView() {
    const t = useTranslations()
    const { transactionCacheList, removeTransaction, fetchTransaction, groupTransactionsByDate } = useTransaction()
    const { categoryCacheList, fetchCategory } = useCategory()
    const { bankAccountCacheList, fetchBankAccount } = useBankAccount()

    const [itemToDelete, setItemToDelete] = useState<ITransaction | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ITransaction | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [dialogUploadOpen, setDialogUploadOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localTransactionList, setLocalTransactionList] = useState<ITransaction[]>([])

    const [transactionFilterSetting, setTransactionFilterSetting] = useState<IFilterOptions>({
        skip: 0,
        take: 20
    })

    useEffect(() => {
        fetchCategory()
        fetchBankAccount()
        fetchTransaction({}, transactionFilterSetting)
    }, [])

    useEffect(() => {
        setLocalTransactionList(transactionCacheList)
    }, [transactionCacheList])

    const loadMore = async () => {
        const currentSkip = transactionFilterSetting.skip ?? 0
        const currentTake = transactionFilterSetting.take ?? 20

        const newOptions = {
            skip: currentSkip + currentTake,
            take: currentTake
        }

        await fetchTransaction({}, newOptions, true)

        setTransactionFilterSetting(newOptions)
    }

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (isEmpty(textToSearch)) {
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
                        <RotateCcw
                            className='cursor-pointer'
                            onClick={() => fetchTransaction({}, transactionFilterSetting)}
                        />
                        <div className='flex flex-row items-center space-x-3'>
                            <Button variant='outline'>
                                <Download></Download>
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button>
                                        <Plus />
                                        {t('buttons.add.base')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align='end'>
                                    <div className='flex flex-col space-y-5'>
                                        <a
                                            className='flex items-center space-x-2 w-full'
                                            onClick={() => {
                                                setDialogUploadOpen(true)
                                            }}
                                        >
                                            <Upload />
                                            <p>{t('buttons.add.import')}</p>
                                        </a>
                                        <Divider />
                                        <a
                                            className='flex items-center space-x-2 w-full'
                                            onClick={() => {
                                                setDialogNewOpen(true)
                                            }}
                                        >
                                            <Plus />
                                            <p>{t('buttons.add.base')}</p>
                                        </a>
                                    </div>
                                </PopoverContent>
                            </Popover>
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
                        <div className='flex flex-col flex-y-2 justify-center items-center w-full'>
                            <Button variant='outline' onClick={loadMore}>
                                {t('buttons.loadMore')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='flex justify-center w-full pt-20'>
                            <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                                <div className='flex flex-col items-center space-y-8 justify-center'>
                                    <ArrowLeftRight />
                                    <div className='flex flex-col items-center space-y-2 justify-center'>
                                        <h4>{t('transactions.empty.title')}</h4>
                                        <p>{t('transactions.empty.subtitle')}</p>
                                    </div>
                                </div>
                                {(bankAccountCacheList.length == 0 || categoryCacheList.length == 0) && (
                                    <>
                                        <Divider />
                                        <div className='flex flex-col items-center space-y-8 justify-center'>
                                            <div className='flex flex-col items-center space-y-2 justify-center'>
                                                <p className='warning'>{t('messages.noCategoriesAndAccountTitle')}</p>
                                                <p className='warning'>{t('messages.noCategoriesAndAccountSub')}</p>
                                            </div>
                                            <div className='flex flex-row space-x-4'>
                                                <Link href='/bank-accounts'>
                                                    <Button variant='outline'>
                                                        <Plus />
                                                        {t('bankAccounts.title')}
                                                    </Button>
                                                </Link>
                                                <Link href='/categories'>
                                                    <Button variant='outline'>
                                                        <Plus />
                                                        {t('categories.title')}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
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
                    dialogHeight={'h-[80vh]'}
                    closeDialog={() => setDialogNewOpen(false)}
                ></TransactionDialog>
            )}

            {itemToEdit && (
                <TransactionDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    dialogHeight='h-[80vh]'
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                />
            )}

            {dialogUploadOpen && (
                <ImportDialog open={true} inEditingMode={true} closeDialog={() => setItemToEdit(null)} />
            )}
        </>
    )
}
