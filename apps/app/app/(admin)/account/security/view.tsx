'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import { UserService } from '@/services/user.service'
import PasswordInput from '@poveroh/ui/components/password'
import Box from '@/components/box/boxWrapper'
import { Loader2 } from 'lucide-react'
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

const userService = new UserService()

interface IPassword {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

export default function SecurityView() {
    const t = useTranslations()

    const [loading, setLoading] = useState(false)

    const objectSetup = z
        .string()
        .nonempty(t('messages.errors.required'))
        .min(
            6,
            t('messages.errors.passwordAtLeastChar', {
                a: 6
            })
        )

    const formSchema = z
        .object({
            oldPassword: objectSetup,
            newPassword: objectSetup,
            confirmPassword: objectSetup
        })
        .refine(data => data.newPassword === data.confirmPassword, {
            message: t('messages.errors.passwordMismatch'),
            path: ['confirmPassword']
        })
        .refine(data => data.oldPassword !== data.newPassword, {
            message: t('messages.errors.passwordMustBeDifferent'),
            path: ['newPassword']
        })

    const defaultValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    })

    const savePassword = async (passwordToSave: IPassword) => {
        setLoading(true)

        await userService
            .updatePassword(passwordToSave.oldPassword, passwordToSave.newPassword)
            .then(() => {
                toast.success(t('settings.account.security.form.password.messages.success'))
                form.reset()
            })
            .catch(error => {
                toast.error(error)
            })

        setLoading(false)
    }

    return (
        <div className='space-y-12'>
            <div className='flex flex-col space-y-3'>
                <h2>{t('settings.account.security.title')}</h2>
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
                            <BreadcrumbPage>{t('settings.account.security.title')}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className='flex flex-col space-y-3'>
                <h4>{t('settings.account.security.form.password.title')}</h4>
                <Box>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(savePassword)} className='flex flex-col space-y-7 w-full '>
                            <div className='flex flex-row gap-7 w-full'>
                                <FormField
                                    control={form.control}
                                    name='oldPassword'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.account.security.form.password.oldpassword')}
                                            </FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    type='password'
                                                    placeholder='&bull;&bull;&bull;&bull;'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='flex flex-row gap-7 w-full'>
                                <FormField
                                    control={form.control}
                                    name='newPassword'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.account.security.form.password.newpassword')}
                                            </FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    type='password'
                                                    placeholder='&bull;&bull;&bull;&bull;'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <FormDescription
                                                dangerouslySetInnerHTML={{
                                                    __html: t('settings.account.security.form.password.description')
                                                }}
                                            ></FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='confirmPassword'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.account.security.form.password.confirmPassword')}
                                            </FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    type='password'
                                                    placeholder='&bull;&bull;&bull;&bull;'
                                                    {...field}
                                                />
                                            </FormControl>
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
