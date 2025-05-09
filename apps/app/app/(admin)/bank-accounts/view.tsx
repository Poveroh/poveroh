'use client'

import { useEffect, useState } from 'react'
import { isEmpty } from 'lodash'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'

import { Download, Landmark, Plus, RotateCcw, Search } from 'lucide-react'

import Box from '@/components/box/boxWrapper'
import { DeleteModal } from '@/components/modal/delete'
import { BankAccountDialog } from '@/components/dialog/bankAccountDialog'

import { IBankAccount } from '@poveroh/types'

import { useBankAccount } from '@/hooks/useBankAccount'
import { BankAccountItem } from '@/components/item/bank-account.item'

export default function BankAccountView() {
    const t = useTranslations()

    const { bankAccountCacheList, removeBankAccount, fetchBankAccount } = useBankAccount()

    const [itemToDelete, setItemToDelete] = useState<IBankAccount | null>(null)
    const [itemToEdit, setItemToEdit] = useState<IBankAccount | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localBankAccountList, setLocalBankAccountList] = useState<IBankAccount[]>(bankAccountCacheList)

    useEffect(() => {
        fetchBankAccount()
    }, [])

    useEffect(() => {
        setLocalBankAccountList(bankAccountCacheList)
    }, [bankAccountCacheList])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (isEmpty(textToSearch)) {
            setLocalBankAccountList(bankAccountCacheList)
            return
        }

        const filteredList = bankAccountCacheList.filter(
            account =>
                account.title.toLowerCase().includes(textToSearch) ||
                account.description.toLowerCase().includes(textToSearch)
        )

        setLocalBankAccountList(filteredList)
    }

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await removeBankAccount(itemToDelete.id)

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
                        <h2>{t('settings.manage.bankAccount.title')}</h2>
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
                                    <BreadcrumbPage>{t('settings.manage.bankAccount.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchBankAccount} />
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
                {localBankAccountList.length > 0 ? (
                    <Box>
                        <>
                            {localBankAccountList.map(account => (
                                <BankAccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={setItemToEdit}
                                    openDelete={setItemToDelete}
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
                    closeDialog={() => setItemToDelete(null)}
                    loading={loading}
                    onConfirm={onDelete}
                ></DeleteModal>
            )}

            {dialogNewOpen && (
                <BankAccountDialog
                    open={dialogNewOpen}
                    inEditingMode={false}
                    closeDialog={() => setDialogNewOpen(false)}
                ></BankAccountDialog>
            )}

            {itemToEdit && (
                <BankAccountDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                ></BankAccountDialog>
            )}
        </>
    )
}
