'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useCallback } from 'react'

import { SelectField, TextField } from '@/components/fields'
import { useOnBoardingForm } from '@/hooks/form/use-onboarding-form'
import { useCountry } from '@/hooks/use-country'
import { StepProgress } from '@/components/other/step-progress'
import { RouteGuard } from '@/components/other/route-guard'
import { OnBoardingStep, ICountry } from '@poveroh/types'

export default function OnBoardingView() {
    const t = useTranslations()
    const { countries, loading: countriesLoading } = useCountry()
    const { formGeneralities, loading, handleGeneralitiesSubmit } = useOnBoardingForm()

    const getOptionLabel = useCallback((country: ICountry) => country.label, [])
    const getOptionValue = useCallback((country: ICountry) => country.value, [])

    const renderOptionContent = useCallback(
        (option: ICountry) => (
            <div className='flex items-center space-x-2'>
                <div className='w-4 h-3 relative'>
                    <Image src={option.flagUrl} alt={option.label} fill sizes='16px' loading='lazy' />
                </div>
                <span>{option.label}</span>
            </div>
        ),
        []
    )

    return (
        <RouteGuard requiredStep={[OnBoardingStep.GENERALITIES, OnBoardingStep.PREFERENCES]}>
            <div className='flex flex-col space-y-14 w-full lg:w-[500px]'>
                <div className='flex flex-col space-y-3'>
                    <h3>{t('signup.title')}</h3>
                    <p className='sub'>{t('signup.subtitle')}</p>
                </div>

                <StepProgress current={OnBoardingStep.GENERALITIES} />

                <Form {...formGeneralities}>
                    <form
                        onSubmit={formGeneralities.handleSubmit(handleGeneralitiesSubmit)}
                        className='flex flex-col space-y-14'
                    >
                        <div className='flex flex-col space-y-6'>
                            <div className='flex flex-row space-x-2 w-full'>
                                <TextField
                                    control={formGeneralities.control}
                                    name='name'
                                    label={t('form.name.label')}
                                    placeholder={t('form.name.placeholder')}
                                    mandatory
                                />

                                <TextField
                                    control={formGeneralities.control}
                                    name='surname'
                                    label={t('form.surname.label')}
                                    placeholder={t('form.surname.placeholder')}
                                    mandatory
                                />
                            </div>

                            <SelectField
                                control={formGeneralities.control}
                                name='country'
                                label={t('form.country.label')}
                                placeholder={countriesLoading ? t('messages.loading') : t('form.country.placeholder')}
                                mandatory
                                options={countries}
                                getOptionLabel={getOptionLabel}
                                getOptionValue={getOptionValue}
                                renderOptionContent={renderOptionContent}
                                disabled={countriesLoading}
                            />
                        </div>

                        <div className='flex flex-col space-y-6'>
                            <Button type='submit' className='w-full' disabled={loading}>
                                {loading && <Loader2 className='animate-spin' />}
                                {t('buttons.next')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </RouteGuard>
    )
}
