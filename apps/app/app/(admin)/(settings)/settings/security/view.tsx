'use client'

import { useTranslations } from 'next-intl'
import Box from '@/components/box/box-wrapper'
import { Loader2 } from 'lucide-react'
import { Button } from '@poveroh/ui/components/button'
import { Form } from '@poveroh/ui/components/form'
import { useProfileSecurityForm } from '@/hooks/form/use-profile-security-form'
import { PasswordField } from '@/components/fields'

export default function SecurityView() {
    const t = useTranslations()
    const { form, loading, handleSubmit } = useProfileSecurityForm()

    return (
        <div className='space-y-12'>
            <div className='flex flex-col space-y-3'>
                <h4>{t('form.password.label')}</h4>
                <Box>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col space-y-7 w-full '>
                            <div className='flex flex-row gap-7 w-full'>
                                <PasswordField
                                    control={form.control}
                                    name='oldPassword'
                                    label={t('form.oldpassword.label')}
                                    placeholder='&bull;&bull;&bull;&bull;'
                                    mandatory
                                />
                            </div>
                            <div className='flex flex-row gap-7 w-full'>
                                <PasswordField
                                    control={form.control}
                                    name='newPassword'
                                    label={t('form.newpassword.label')}
                                    placeholder='&bull;&bull;&bull;&bull;'
                                    description={t('form.newpassword.description')}
                                    mandatory
                                />

                                <PasswordField
                                    control={form.control}
                                    name='confirmPassword'
                                    label={t('form.confirmPassword.label')}
                                    placeholder='&bull;&bull;&bull;&bull;'
                                    mandatory
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
