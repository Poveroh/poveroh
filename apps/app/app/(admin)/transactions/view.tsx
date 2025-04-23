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
import { Download, Landmark, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import Box from '@/components/box/boxWrapper'
import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types/dist'
import { DeleteModal } from '@/components/modal/delete'
import _ from 'lodash'
import { Modal } from '@/components/modal/form'
import { BrandIcon } from '@/components/icon/brandIcon'
import { TransactionDialog } from '@/components/dialog/transactionDialog'

const bankAccountService = new BankAccountService()

type BankAccountItemProps = {
    account: IBankAccount
    openDelete: (item: IBankAccount) => void
    openEdit: (item: IBankAccount) => void
}

function BankAccountItem({ account, openDelete, openEdit }: BankAccountItemProps) {
    const logo_icon = `url(${account.logo_icon})`

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <BrandIcon icon={logo_icon}></BrandIcon>
                <div>
                    <p>{account.title}</p>
                    <p className='sub'>{account.description}</p>
                </div>
            </div>
            <div className='flex flex-col items-center'>
                <div className='flex flex-row space-x-5 items-center'>
                    <Pencil className='cursor-pointer' onClick={() => openEdit(account)} />
                    <Trash2 className='danger cursor-pointer' onClick={() => openDelete(account)} />
                </div>
            </div>
        </div>
    )
}

export default function TransactionsView() {
    const t = useTranslations()

    const [itemToDelete, setItemToDelete] = useState<IBankAccount | null>(null)
    const [itemToEdit, setItemToEdit] = useState<IBankAccount | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [bankAccountList, setBankAccountList] = useState<IBankAccount[]>([])
    const [backupAccountList, setBackupAccountList] = useState<IBankAccount[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const res = await bankAccountService.read<IBankAccount[]>()

        setBankAccountList(res)
        setBackupAccountList(res)
    }

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (_.isEmpty(textToSearch)) {
            setBankAccountList(backupAccountList)
            return
        }

        const filteredList = backupAccountList.filter(
            account =>
                account.title.toLowerCase().includes(textToSearch) ||
                account.description.toLowerCase().includes(textToSearch)
        )

        setBankAccountList(filteredList)
    }

    const openDelete = (item: IBankAccount) => {
        setItemToDelete(item)
    }

    const closeDelete = () => {
        setItemToDelete(null)
    }

    const openEdit = (item: IBankAccount) => {
        setItemToEdit(item)
    }

    const closeEdit = () => {
        setItemToEdit(null)
    }

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await bankAccountService.delete(itemToDelete?.id)

        setLoading(false)
        if (res) setItemToDelete(null)

        fetchData()
    }

    const saveBankAccount = async (formData: FormData) => {
        const acccount = await bankAccountService.save(formData)
        const newList = bankAccountList.map(account => {
            if (account.id === acccount.id) {
                return acccount
            }
            return account
        })
        setBankAccountList(newList)
        setBackupAccountList(newList)
        setItemToEdit(null)
    }

    const addNewBankAccount = async (formData: FormData) => {
        const resAccount = await bankAccountService.add(formData)
        const newList = [...bankAccountList, resAccount].sort((a, b) => b.created_at.localeCompare(a.created_at))
        setBankAccountList(newList)
        setBackupAccountList(newList)
        setDialogNewOpen(false)
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
                        <RotateCcw className='cursor-pointer' onClick={fetchData} />
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
                {bankAccountList.length > 0 ? (
                    <Box>
                        <>
                            {bankAccountList.map(account => (
                                <BankAccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={openEdit}
                                    openDelete={openDelete}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                        <Landmark />
                        <div className='flex flex-col items-center space-y-2 justify-center'>
                            <h4>{t('bankAccounts.empty.title')}</h4>
                            <p>{t('bankAccounts.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            {itemToDelete && (
                <DeleteModal
                    title={itemToDelete.title}
                    description={t('bankAccounts.modal.deleteDescription')}
                    open={true}
                    closeDialog={closeDelete}
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

            {/* <Modal open={true} title={t('transactions.modal.newTitle')} handleOpenChange={setDialogNewOpen}>
                <TransactionsForm
                    onSubmit={addNewBankAccount}
                    inEditingMode={false}
                    closeDialog={() => setDialogNewOpen(false)}
                />
            </Modal> */}

            {/* <IncomeForm inEditingMode={true} onSubmit={saveBankAccount} closeDialog={closeEdit}></IncomeForm> */}

            {/* {itemToEdit && (
                <Modal
                    open={true}
                    title={itemToEdit?.title || ''}
                    icon={itemToEdit?.logo_icon}
                    handleOpenChange={closeEdit}
                >
                    <BankAccountForm
                        initialData={itemToEdit}
                        inEditingMode={true}
                        onSubmit={saveBankAccount}
                        closeDialog={closeEdit}
                    />
                </Modal>
            )} */}
        </>
    )
}
