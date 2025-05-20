'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'

import { CopyableInput } from '@poveroh/ui/components/input-copyable'
import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'

import { Loader2 } from 'lucide-react'

import Box from '@/components/box/BoxWrapper'

import { IUserToSave } from '@poveroh/types'
import { useUser } from '@/hooks/useUser'
import { toast } from '@poveroh/ui/components/sonner'

export default function ProfileView() {
    const t = useTranslations()

    const { user, saveUser } = useUser()
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        name: z.string().nonempty(t('messages.errors.required')),
        surname: z.string().nonempty(t('messages.errors.required')),
        email: z.string().nonempty(t('messages.errors.required')).email(t('messages.errors.email'))
    })

    const defaultValues = user || {
        name: '',
        surname: '',
        email: ''
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    useEffect(() => {
        form.reset(user)
    }, [user, form])

    const save = async (userToSave: IUserToSave) => {
        setLoading(true)

        const res = await saveUser(userToSave)
        if (res) {
            toast.success(t('form.messages.userSavedSuccess'))
        }

        setLoading(false)
    }

    return (
        <div className='space-y-12'>
            <div className='flex flex-col space-y-3'>
                <h2>{t('settings.account.personalInfo.title')}</h2>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href='/settings'>{t('settings.title')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href='/settings'>{t('settings.account.title')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{t('settings.account.personalInfo.title')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className='flex flex-col space-y-3'>
                <h4>{t('settings.account.personalInfo.title')}</h4>
                <Box>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(save)} className='flex flex-col space-y-7 w-full'>
                            <FormItem>
                                <FormLabel>{t('form.id.label')}</FormLabel>
                                <FormControl>
                                    <CopyableInput value={user.id} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            <div className='flex flex-row space-x-2 w-full'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel mandatory>{t('form.name.label')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('form.name.placeholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='surname'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel mandatory>{t('form.surname.label')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('form.surname.placeholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='flex flex-row space-x-2 w-full'>
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('form.email.label')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('form.email.placeholder')} {...field} />
                                            </FormControl>
                                            <FormDescription>{t('form.email.subTitle')}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='flex flex-col items-end w-full'>
                                <Button type='submit' disabled={loading}>
                                    {loading && <Loader2 className='animate-spin' />}
                                    {t('buttons.save')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </Box>
            </div>
        </div>
    )
}
