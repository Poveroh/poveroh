'use client'

import Link from 'next/link'
import { Form } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import { useTranslations } from 'next-intl'
import { useSignInForm } from '@/hooks/form/use-sign-in-form'
import { EmailField, PasswordField } from '@/components/fields'

export default function LoginView() {
    const t = useTranslations()
    const { form, loading, handleSignIn } = useSignInForm()

    return (
        <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
            <div className='flex flex-col space-y-3'>
                <h3>{t('signin.title')}</h3>
                <p className='sub'>{t('signin.subtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className='flex flex-col space-y-14'>
                    <fieldset className='flex flex-col space-y-6' disabled={loading}>
                        <EmailField control={form.control} disabled={loading} />
                        <PasswordField control={form.control} disabled={loading} />
                    </fieldset>

                    <footer className='flex flex-col space-y-6'>
                        <Button type='submit' className='w-full' disabled={loading}>
                            {loading && <Loader2 className='animate-spin mr-2' size={16} />}
                            {t('signin.buttons.sign_in')}
                        </Button>

                        <div className='flex justify-end'>
                            <Link href='/change-password' className='text-sm hover:underline'>
                                {t('signin.buttons.forgot_password')}
                            </Link>
                        </div>
                    </footer>
                </form>
            </Form>
        </div>
    )
}
