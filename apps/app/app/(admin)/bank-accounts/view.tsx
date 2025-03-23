'use client'

import { Button } from '@poveroh/ui/components/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@poveroh/ui/components/breadcrumb'
import { useTranslations } from 'next-intl'
import { Input } from '@poveroh/ui/components/input'
import { useEffect, useState } from 'react'
import { Download, Pencil, Plus, RotateCcw, Search } from 'lucide-react'
import Link from 'next/link'
import Box from '@/components/box/boxWrapper'
import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types/dist'
import { DeleteModal } from '@/components/modal/delete'
import _ from 'lodash'

const bankAccountService = new BankAccountService()

type BankAccountItemProps = {
    account: IBankAccount
    reload: () => void
}

function BankAccountItem({ account, reload }: BankAccountItemProps) {
    const t = useTranslations()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const logo_icon = `url(${account.logo_icon})`

    const onDelete = async () => {
        setLoading(true)

        const res = await bankAccountService.delete(account.id)

        setLoading(false)
        if (res) setOpen(false)

        reload()
    }

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='brands' style={{ backgroundImage: logo_icon }}></div>
                <div>
                    <p>{account.title}</p>
                    <p className='sub'>{account.description}</p>
                </div>
            </div>
            <div className='flex flex-col items-center'>
                <div className='flex flex-row space-x-5 items-center'>
                    <Link href={`/bank-accounts/${account.id}`}>
                        <Pencil className='cursor-pointer' />
                    </Link>
                    <DeleteModal
                        title={account.title}
                        description={t('bankAccounts.modal.deleteDescription')}
                        open={open}
                        setOpen={x => setOpen(x)}
                        loading={loading}
                        onConfirm={onDelete}
                    ></DeleteModal>
                </div>
            </div>
        </div>
    )
}

export default function BankAccountView() {
    const t = useTranslations()
    const [bankAccountList, setBankAccountList] = useState<IBankAccount[]>([])
    const [backupAccountList, setBackupAccountList] = useState<IBankAccount[]>([])

    const fetchData = async () => {
        const res = await bankAccountService.read<IBankAccount[]>()

        setBankAccountList(res)
        setBackupAccountList(res)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        if (_.isEmpty(textToSearch)) {
            setBankAccountList(backupAccountList)
            return
        }

        const filteredList = backupAccountList.filter(account => account.title.toLowerCase().includes(textToSearch) || account.description.toLowerCase().includes(textToSearch))

        setBankAccountList(filteredList)
    }

    return (
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
                                <BreadcrumbLink href=''>{t('settings.manage.title')}</BreadcrumbLink>
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
                        <Link href='/bank-accounts/new'>
                            <Button>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='flex flex-col'>
                <Input startIcon={Search} placeholder={t('messages.search')} className='w-1/3' onChange={onSearch} />
            </div>
            <Box>
                <>
                    {bankAccountList.map(account => (
                        <BankAccountItem key={account.id} account={account} reload={fetchData} />
                    ))}
                </>
            </Box>
        </div>
    )
}
