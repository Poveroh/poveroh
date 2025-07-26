'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import { TextField, EmailField, PasswordField } from '@/components/fields'
import { useSignUpForm } from '@/hooks/form/use-sign-up-form'

export default function SignupView() {
    const t = useTranslations()
    const { form, loading, handleSubmit } = useSignUpForm()

    return (
        <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
            <div className='flex flex-col space-y-3'>
                <h3>{t('signup.title')}</h3>
                <p className='sub'>{t('signup.subtitle')}</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col space-y-14'>
                    <div className='flex flex-col space-y-6'>
                        <div className='flex flex-row space-x-2 w-full'>
                            <TextField
                                control={form.control}
                                name='name'
                                label={t('form.name.label')}
                                placeholder={t('form.name.placeholder')}
                                mandatory
                            />

                            <TextField
                                control={form.control}
                                name='surname'
                                label={t('form.surname.label')}
                                placeholder={t('form.surname.placeholder')}
                                mandatory
                            />
                        </div>

                        <EmailField
                            control={form.control}
                            name='email'
                            label={t('form.email.label')}
                            placeholder={t('form.email.placeholder')}
                            mandatory
                        />

                        <PasswordField
                            control={form.control}
                            name='password'
                            label={t('form.password.label')}
                            placeholder='&bull;&bull;&bull;&bull;'
                            description={t('form.newpassword.description')}
                            mandatory
                        />
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
