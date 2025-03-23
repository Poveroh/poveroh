'use client'

import { Button } from '@poveroh/ui/components/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@poveroh/ui/components/breadcrumb'
import { useTranslations } from 'next-intl'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Box from '@/components/box/boxWrapper'
import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types/dist'

const bankAccountService = new BankAccountService()

type BankAccountItemProps = {
    account: IBankAccount
}

function BankAccountItem({ account }: BankAccountItemProps) {
    const logo_icon = `url(${account.logo_icon})`
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
                <div className='flex flex-row space-x-1 items-center'>
                    <Link href={`/bank-accounts/${account.id}`}>
                        <Pencil className='cursor-pointer' />
                    </Link>
                    <Trash2 className='danger cursor-pointer' />
                </div>
            </div>
        </div>
    )
}

export default function BankAccountView() {
    const t = useTranslations()
    const [bankAccountList, setBankAccountList] = useState<IBankAccount[]>([])

    useEffect(() => {
        const fetchData = async () => {
            setBankAccountList(await bankAccountService.read())
        }
        fetchData()
    }, [])

    const searchSchema = z.object({
        search: z.string()
    })

    const form = useForm({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: ''
        }
    })

    useEffect(() => {
        form.reset({
            search: ''
        })
    }, [form])

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
                <div className='flex flex-row space-x-3'>
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
            <div className='flex flex-col'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(() => {})} className='w-[400px]'>
                        <FormField
                            control={form.control}
                            name='search'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder={t('messages.search')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
            <Box>
                <>
                    {bankAccountList.map(account => (
                        <BankAccountItem key={account.id} account={account} />
                    ))}
                </>
            </Box>
        </div>
    )
}
