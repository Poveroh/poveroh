'use client'

import { Button } from '@poveroh/ui/components/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@poveroh/ui/components/breadcrumb'
import { useTranslations } from 'next-intl'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserService } from '@/services/user.service'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import Link from 'next/link'
import Box from '@/components/box/boxWrapper'
import { BankAccountService } from '@/services/bankaccount.service'
import { IBankAccount } from '@poveroh/types/dist'
import { Label } from '@poveroh/ui/components/label'
import { server } from '@/lib/server'

const bankAccountService = new BankAccountService()

type BankAccountItemProps = {
    account: IBankAccount
}

function BankAccountItem({ account }: BankAccountItemProps) {
    const bgImage = 'url(file:///Users/davidetarditi/Documents/Project/Beycloud/test/skyline.jpg)' //`url(${account.logo_icon})`
    return (
        <div className='flex flex-row justify-between items-center w-full p-5'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='brands' style={{ backgroundImage: bgImage }}></div>
                <div>
                    <p>{account.title}</p>
                    <p className='sub'>{account.description}</p>
                </div>
            </div>
            <div className='flex flex-col items-center'>
                <div className='flex flex-row space-x-1 items-center'></div>
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

    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const formData = new FormData()
            formData.append('file', event.target.files[0])

            await server.post('/bank-account/upload', formData, true)
        }
    }

    const handleUpload = () => {
        if (file) {
            console.log('Uploading:', file.name)
            // Add upload logic here (e.g., send file to API)
        }
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
                <div className='flex flex-row space-x-3'>
                    <Button variant='outline'>
                        <Download></Download>
                        {t('buttons.export.base')}
                    </Button>
                    <Button>
                        <Plus />
                        {t('buttons.add.base')}
                    </Button>
                    <Link href='/bank-accounts/ciaociao'>click me</Link>
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
                    {/* {bankAccountList.map(account => (
                        <BankAccountItem key={account.id} account={account} />
                    ))} */}
                    <div className='grid w-full max-w-sm items-center gap-1.5'>
                        <Label htmlFor='picture'>Picture</Label>
                        <Input id='picture' type='file' onChange={handleFileChange} />
                    </div>{' '}
                </>
            </Box>
        </div>
    )
}
