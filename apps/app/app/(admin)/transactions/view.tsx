'use client'

import { useEffect, useMemo } from 'react'
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
import { useTransactionSearch } from '@/hooks/useTransactionSearch'
import { useTransactionFilters } from '@/hooks/useTransactionFilters'
import { useTransactionModals } from '@/hooks/useTransactionModals'

import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Divider } from '@/components/other/Divider'
import { ImportDialog } from '@/components/dialog/ImportDialog'

export default function TransactionsView() {
    const t = useTranslations()

    // Core hooks
    const { transactionCacheList, removeTransaction, fetchTransaction, groupTransactionsByDate } = useTransaction()
    const { categoryCacheList, fetchCategory } = useCategory()
    const { bankAccountCacheList, fetchBankAccount } = useBankAccount()

    // Custom hooks for optimized functionality
    const { filteredTransactions, handleSearch } = useTransactionSearch({
        transactions: transactionCacheList
    })

    const {
        filters,
        isLoading: isFilterLoading,
        loadMore,
        refresh
    } = useTransactionFilters({
        initialSkip: 0,
        initialTake: 20,
        onFilterChange: async (newFilters, append = false) => {
            await fetchTransaction({}, newFilters, append)
        }
    })

    const {
        itemToDelete,
        itemToEdit,
        isNewDialogOpen,
        isUploadDialogOpen,
        isDeleteLoading,
        openDeleteModal,
        closeDeleteModal,
        openEditModal,
        closeEditModal,
        openNewDialog,
        closeNewDialog,
        openUploadDialog,
        closeUploadDialog,
        handleDelete
    } = useTransactionModals()

    // Memoize grouped transactions for performance
    const groupedTransactions = useMemo(() => {
        return Object.entries(groupTransactionsByDate(filteredTransactions)).sort(([a], [b]) => b.localeCompare(a))
    }, [filteredTransactions, groupTransactionsByDate])

    // Memoize empty state condition
    const hasRequiredData = useMemo(() => {
        return bankAccountCacheList.length > 0 && categoryCacheList.length > 0
    }, [bankAccountCacheList.length, categoryCacheList.length])

    useEffect(() => {
        const initializeData = async () => {
            await Promise.all([fetchCategory(), fetchBankAccount(), fetchTransaction({}, filters)])
        }

        initializeData()
    }, [fetchCategory, fetchBankAccount, fetchTransaction, filters])

    const onDelete = async () => {
        const wrappedRemoveTransaction = async (id: string): Promise<boolean> => {
            const result = await removeTransaction(id)
            return result === true
        }

        await handleDelete(wrappedRemoveTransaction)
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
                        <RotateCcw className='cursor-pointer' onClick={refresh} />
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
                                        <button
                                            type='button'
                                            className='flex items-center space-x-2 w-full text-left hover:opacity-75'
                                            onClick={openUploadDialog}
                                        >
                                            <Upload />
                                            <p>{t('buttons.add.import')}</p>
                                        </button>
                                        <Divider />
                                        <button
                                            type='button'
                                            className='flex items-center space-x-2 w-full text-left hover:opacity-75'
                                            onClick={openNewDialog}
                                        >
                                            <Plus />
                                            <p>{t('buttons.add.base')}</p>
                                        </button>
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
                        onChange={handleSearch}
                    />
                </div>
                {filteredTransactions.length > 0 ? (
                    <>
                        {groupedTransactions.map(([date, transactions]) => (
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
                                                openEdit={openEditModal}
                                                openDelete={openDeleteModal}
                                            />
                                        ))}
                                    </>
                                </Box>
                            </div>
                        ))}
                        <div className='flex flex-col flex-y-2 justify-center items-center w-full'>
                            <Button variant='outline' onClick={loadMore} disabled={isFilterLoading}>
                                {isFilterLoading ? t('buttons.loading') : t('buttons.loadMore')}
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
                                {!hasRequiredData && (
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
                    closeDialog={closeDeleteModal}
                    loading={isDeleteLoading}
                    onConfirm={onDelete}
                ></DeleteModal>
            )}

            {isNewDialogOpen && (
                <TransactionDialog
                    open={isNewDialogOpen}
                    dialogHeight={'h-[80vh]'}
                    closeDialog={closeNewDialog}
                ></TransactionDialog>
            )}

            {itemToEdit && (
                <TransactionDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    dialogHeight='h-[80vh]'
                    inEditingMode={true}
                    closeDialog={closeEditModal}
                />
            )}

            {isUploadDialogOpen && <ImportDialog open={true} inEditingMode={true} closeDialog={closeUploadDialog} />}
        </>
    )
}
