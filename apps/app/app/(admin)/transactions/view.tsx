'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'

import { ArrowLeftRight, Plus, Search } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { TransactionDialog } from '@/components/dialog/transaction-dialog'
import { TransactionItem } from '@/components/item/transaction-item'

import { useTransaction } from '@/hooks/use-transaction'
import { useCategory } from '@/hooks/use-category'
import { useAccount } from '@/hooks/use-account'

import { IFilterOptions, ITransaction } from '@poveroh/types'

import { isEmpty } from 'lodash'
import Divider from '@/components/other/divider'
import { Header } from '@/components/other/header-page'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export default function TransactionsView() {
    const t = useTranslations()
    const { transactionCacheList, fetchTransaction, groupTransactionsByDate, transactionLoading } = useTransaction()
    const { categoryCacheList, fetchCategory, categoryLoading } = useCategory()
    const { accountCacheList, fetchAccount, accountLoading } = useAccount()

    const { openModal } = useModal<ITransaction>()
    const { openModal: openDeleteModal } = useDeleteModal<ITransaction>()

    const [localTransactionList, setLocalTransactionList] = useState<ITransaction[]>([])

    const [transactionFilterSetting, setTransactionFilterSetting] = useState<IFilterOptions>({
        skip: 0,
        take: 20
    })

    useEffect(() => {
        fetchCategory()
        fetchAccount()
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

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('transactions.title')}
                    breadcrumbs={[{ label: t('dashboard.title'), href: '/' }, { label: t('transactions.title') }]}
                    fetchAction={{
                        onClick: () => fetchTransaction({}, transactionFilterSetting),
                        loading: transactionLoading.fetch || categoryLoading.fetchCategory || accountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => openModal('create'),
                        loading: transactionLoading.add
                    }}
                />

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
                                                    openEdit={(item: ITransaction) => {
                                                        openModal('edit', item)
                                                    }}
                                                    openDelete={openDeleteModal}
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
                                {(accountCacheList.length == 0 || categoryCacheList.length == 0) && (
                                    <>
                                        <Divider />
                                        <div className='flex flex-col items-center space-y-8 justify-center'>
                                            <div className='flex flex-col items-center space-y-2 justify-center'>
                                                <p className='warning'>{t('messages.noCategoriesAndAccountTitle')}</p>
                                                <p className='warning'>{t('messages.noCategoriesAndAccountSub')}</p>
                                            </div>
                                            <div className='flex flex-row space-x-4'>
                                                <Link href='/accounts'>
                                                    <Button variant='outline'>
                                                        <Plus />
                                                        {t('accounts.title')}
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

            <TransactionDialog></TransactionDialog>

            {/* {dialogUploadOpen && (
                <ImportDialog open={true} inEditingMode={true} closeDialog={() => setItemToEdit(null)} />
            )} */}
        </>
    )
}
