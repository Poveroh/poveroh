'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import PasswordInput from '@poveroh/ui/components/password'
import { useAuth } from '@/hooks/userAuth'

export default function SignupView() {
    const t = useTranslations()
    const { signUp } = useAuth()

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
            name: z.string().nonempty(t('messages.errors.required')),
            surname: z.string().nonempty(t('messages.errors.required')),
            email: z.string().nonempty(t('messages.errors.required')).email(t('messages.errors.email')),
            password: objectSetup,
            confirmPassword: objectSetup
        })
        .refine(data => data.password === data.confirmPassword, {
            message: t('messages.errors.passwordMismatch'),
            path: ['confirmPassword']
        })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            surname: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const handleSignUp = async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        const { confirmPassword, ...user } = values

        const res = await signUp(user)

        if (res) {
            window.location.href = '/dashboard'
        }

        setLoading(false)
    }

    return (
        <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
            <div className='flex flex-col space-y-3'>
                <h3>{t('signup.title')}</h3>
                <p className='sub'>{t('signup.subtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className='flex flex-col space-y-14'>
                    <div className='flex flex-col space-y-6'>
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
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>{t('form.email.label')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('form.email.placeholder')} type='email' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex flex-row space-x-2'>
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel mandatory>{t('form.password.label')}</FormLabel>
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
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel mandatory>{t('form.confirmPassword.label')}</FormLabel>
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
                    </div>
                    <div className='flex flex-col space-y-6'>
                        <Button type='submit' className='w-full' disabled={loading}>
                            {loading && <Loader2 className='animate-spin' />}
                            {t('signup.buttons.sign_up')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
