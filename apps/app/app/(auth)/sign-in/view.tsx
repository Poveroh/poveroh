'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import * as z from 'zod'
import { useTranslations } from 'next-intl'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import PasswordInput from '@poveroh/ui/components/password'
import { IUserLogin } from '@poveroh/types'
import { useAuth } from '@/hooks/userAuth'

export default function LoginView() {
    const t = useTranslations()
    const { signIn } = useAuth()

    const [loading, setLoading] = useState(false)

    const loginSchema = z.object({
        email: z.string().nonempty(t('messages.errors.required')).email(t('messages.errors.email')),
        password: z
            .string()
            .nonempty(t('messages.errors.required'))
            .min(
                6,
                t('messages.errors.passwordAtLeastChar', {
                    a: 6
                })
            )
    })

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const handleSignIn = async (user: IUserLogin) => {
        setLoading(true)

        const res = await signIn(user)

        if (res) {
            window.location.href = '/dashboard'
        }

        setLoading(false)
    }

    return (
        <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
            <div className='flex flex-col space-y-3'>
                <h3>{t('signin.title')}</h3>
                <p className='sub'>{t('signin.subtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className='flex flex-col space-y-14'>
                    <div className='flex flex-col space-y-6'>
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>E-mail</FormLabel>
                                    <FormControl>
                                        <Input placeholder='example@mail.com' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel mandatory>Password</FormLabel>
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
                    <div className='flex flex-col space-y-6'>
                        <Button type='submit' className='w-full' disabled={loading}>
                            {loading && <Loader2 className='animate-spin' />}
                            {t('signin.buttons.sign_in')}
                        </Button>

                        <div className='flex justify-end'>
                            <Link href='/change-password'>{t('signin.buttons.forgot_password')}</Link>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
