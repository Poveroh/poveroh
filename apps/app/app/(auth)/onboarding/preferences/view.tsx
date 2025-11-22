'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import { CurrencyField, SelectField } from '@/components/fields'
import { useOnBoardingForm } from '@/hooks/form/use-onboarding-form'
import { StepProgress } from '@/components/other/step-progress'
import { RouteGuard } from '@/components/other/route-guard'
import { dateFormatCatalog, languageCatalog, OnBoardingStep } from '@poveroh/types'

export default function OnBoardingPreferencesView() {
    const t = useTranslations()
    const { formPreferences, loading, handlePreferencesSubmit } = useOnBoardingForm()

    return (
        <RouteGuard requiredStep={[OnBoardingStep.GENERALITIES, OnBoardingStep.PREFERENCES]}>
            <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
                <div className='flex flex-col space-y-3'>
                    <h3>{t('signup.title')}</h3>
                    <p className='sub'>{t('signup.subtitle')}</p>
                </div>

                <StepProgress current={OnBoardingStep.PREFERENCES} />

                <Form {...formPreferences}>
                    <form
                        onSubmit={formPreferences.handleSubmit(handlePreferencesSubmit)}
                        className='flex flex-col space-y-14'
                    >
                        <div className='flex flex-col space-y-6'>
                            <CurrencyField
                                form={formPreferences}
                                control={formPreferences.control}
                                name='preferredCurrency'
                                label={t('form.currency.label')}
                                placeholder={t('form.currency.placeholder')}
                                mandatory={true}
                            />

                            <SelectField
                                control={formPreferences.control}
                                name='preferredLanguage'
                                label={t('form.language.label')}
                                placeholder={t('form.language.placeholder')}
                                mandatory
                                options={languageCatalog}
                                getOptionLabel={l => l.label}
                                getOptionValue={l => l.value}
                            />

                            <SelectField
                                control={formPreferences.control}
                                name='dateFormat'
                                label={t('form.dateFormat.label')}
                                placeholder={t('form.dateFormat.placeholder')}
                                mandatory
                                options={dateFormatCatalog}
                                getOptionLabel={d => d.label}
                                getOptionValue={d => d.value}
                            />
                        </div>

                        <div className='flex flex-col space-y-6'>
                            <Button type='submit' className='w-full' disabled={loading}>
                                {loading && <Loader2 className='animate-spin' />}
                                {t('buttons.complete')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </RouteGuard>
    )
}
