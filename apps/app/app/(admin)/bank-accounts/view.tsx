'use client'

import { useEffect, useState } from 'react'
import _ from 'lodash'
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

import { Download, Landmark, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'

import Box from '@/components/box/boxWrapper'
import { BrandIcon } from '@/components/icon/brandIcon'
import { DeleteModal } from '@/components/modal/delete'
import { BankAccountDialog } from '@/components/dialog/bankAccountDialog'

import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types/dist'

import { useCache } from '@/hooks/useCache'

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

export default function BankAccountView() {
    const t = useTranslations()

    const { bankAccountCacheList, bankAccountCache } = useCache()

    const bankAccountService = new BankAccountService()

    const [itemToDelete, setItemToDelete] = useState<IBankAccount | null>(null)
    const [itemToEdit, setItemToEdit] = useState<IBankAccount | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localBankAccountList, setLocalBankAccountList] = useState<IBankAccount[]>(bankAccountCacheList)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        setLocalBankAccountList(bankAccountCacheList)
    }, [bankAccountCacheList])

    const fetchData = async () => {
        const res = await bankAccountService.read<IBankAccount[]>()

        bankAccountCache.set(res)
    }

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (_.isEmpty(textToSearch)) {
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

        const res = await bankAccountService.delete(itemToDelete?.id)

        setLoading(false)
        if (res) setItemToDelete(null)

        fetchData()
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
