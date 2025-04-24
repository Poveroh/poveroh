'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { useRouter } from 'next/navigation'
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
import { toast } from '@poveroh/ui/components/sonner'

import { Loader2 } from 'lucide-react'

import { UserService } from '@/services/user.service'
import Box from '@/components/box/boxWrapper'
import { useAuthStore } from '@/store/auth.store'

import { IUserToSave } from '@poveroh/types'

const userService = new UserService()

export default function ProfileView() {
    const t = useTranslations()
    const router = useRouter()

    const { user, setUser } = useAuthStore()
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

    const saveUser = async (userToSave: IUserToSave) => {
        setLoading(true)
        await userService
            .save(userToSave)
            .then(() => {
                toast.success(t('settings.account.personalInfo.form.generalities.messages.success'))

                setUser({ ...user, ...userToSave })

                if (!isEqual(user.email, userToSave.email)) {
                    router.push('/logout')
                }
            })
            .catch(error => {
                toast.error(error)
            })

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
                <h4>{t('settings.account.personalInfo.form.generalities.title')}</h4>
                <Box>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(saveUser)} className='flex flex-col space-y-7 w-full'>
                            <div className='flex flex-row gap-7 w-full'>
                                <FormField
                                    control={form.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.account.personalInfo.form.generalities.name')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>
                                                {t('settings.account.personalInfo.form.generalities.surname')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='flex flex-col space-y-3'>
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder='example@mail.com' {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                {t('settings.account.personalInfo.form.generalities.email.subTitle')}
                                            </FormDescription>
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
