'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { Button } from '@poveroh/ui/components/button'
import Link from 'next/link'
import PasswordInput from '@poveroh/ui/components/password'
import { signIn } from '@/lib/auth/auth'

const loginSchema = z.object({
    email: z.string().nonempty('Email is required').email('Invalid email address'),
    password: z
        .string()
        .nonempty('Password is required')
        .min(6, 'Password must be at least 6 characters')
})

export default function LoginPage() {
    const t = useTranslations()

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    interface LoginFormData {
        email: string
        password: string
    }

    const onSubmit = (data: LoginFormData) => {
        signIn(data)
        console.log(data)
    }

    return (
        <div className='flex flex-col space-y-14 w-[500px]'>
            <div className='flex flex-col space-y-3'>
                <h3>{t('login.title')}</h3>
                <p className='sub'>{t('login.subtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col space-y-14'>
                    <div className='flex flex-col space-y-6'>
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
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
                                    <FormLabel>Password</FormLabel>
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
                        <Button type='submit' className='w-full'>
                            {t('login.buttons.sign_in')}
                        </Button>

                        <div className='flex justify-end'>
                            <Link href='/change-password'>
                                {t('login.buttons.forgot_password')}
                            </Link>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
