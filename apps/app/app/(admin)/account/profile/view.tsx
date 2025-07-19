'use client'

import { useTranslations } from 'next-intl'

import { CopyableField } from '@/components/field/CopyableField'
import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { Form } from '@poveroh/ui/components/form'

import { Loader2 } from 'lucide-react'

import Box from '@/components/box/BoxWrapper'

import { useProfileForm } from '@/hooks/form/useProfileForm'
import { EmailField, TextField } from '@/components/field'

export default function ProfileView() {
    const t = useTranslations()

    const { form, user, loading, handleSubmit } = useProfileForm()

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
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col space-y-7 w-full'>
                            <CopyableField value={user.id} />
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
                            <div className='flex flex-row space-x-2 w-full'>
                                <EmailField
                                    control={form.control}
                                    name='email'
                                    label={t('form.email.label')}
                                    placeholder={t('form.email.placeholder')}
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
