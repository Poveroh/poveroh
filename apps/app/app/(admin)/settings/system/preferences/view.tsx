'use client'

import { useTranslations } from 'next-intl'

import { Loader2 } from 'lucide-react'

import { Button } from '@poveroh/ui/components/button'
import { Form } from '@poveroh/ui/components/form'

import Box from '@/components/box/box-wrapper'
import { CurrencyField, SelectField } from '@/components/fields'
import { Header } from '@/components/other/header-page'
import { languageCatalog, dateFormatCatalog, timezoneCatalog } from '@poveroh/types'
import { usePreferencesForm } from '@/hooks/form/use-preferences-form'

export default function PreferencesView() {
    const t = useTranslations()

    const { form, loading, handleSubmit } = usePreferencesForm()

    return (
        <div className='space-y-12'>
            <Header
                title={t('settings.system.globalPreferences.title')}
                breadcrumbs={[
                    { label: t('settings.title'), href: '/settings' },
                    { label: t('settings.system.title'), href: '/settings' },
                    { label: t('settings.system.globalPreferences.title') }
                ]}
            />
            <div className='flex flex-col space-y-3'>
                <h4>{t('settings.system.globalPreferences.title')}</h4>
                <Box>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col space-y-7 w-full'>
                            <CurrencyField
                                form={form}
                                control={form.control}
                                name='preferredCurrency'
                                label={t('form.currency.label')}
                                placeholder={t('form.currency.placeholder')}
                                mandatory={true}
                            />

                            <SelectField
                                control={form.control}
                                name='preferredLanguage'
                                label={t('form.language.label')}
                                placeholder={t('form.language.placeholder')}
                                mandatory
                                options={languageCatalog}
                                getOptionLabel={l => l.label}
                                getOptionValue={l => l.value}
                            />

                            <SelectField
                                control={form.control}
                                name='dateFormat'
                                label={t('form.dateFormat.label')}
                                placeholder={t('form.dateFormat.placeholder')}
                                mandatory
                                options={dateFormatCatalog}
                                getOptionLabel={d => d.label}
                                getOptionValue={d => d.value}
                            />

                            <SelectField
                                control={form.control}
                                name='timezone'
                                label={t('form.timezone.label')}
                                placeholder={t('form.timezone.placeholder')}
                                mandatory
                                options={timezoneCatalog}
                                getOptionLabel={tz => tz.label}
                                getOptionValue={tz => tz.value}
                            />
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
