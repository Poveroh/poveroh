'use client'

import { useTranslations } from 'next-intl'
import { Form } from '@poveroh/ui/components/form'
import { Button } from '@poveroh/ui/components/button'
import { Loader2 } from 'lucide-react'

import { TextField } from '@/components/fields'
import { useOnBoardingForm } from '@/hooks/form/use-onboarding-form'
import { StepProgress } from '@/components/other/step-progress'
import { RouteGuard } from '@/components/other/route-guard'
import { OnBoardingStep } from '@poveroh/types'
import { CountryField } from '@/components/fields/country-field'

export default function OnBoardingView() {
    const t = useTranslations()
    const { formGeneralities, loading, handleGeneralitiesSubmit } = useOnBoardingForm()

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

                            <CountryField
                                control={formGeneralities.control}
                                name='country'
                                label={t('form.country.label')}
                                placeholder={t('form.country.placeholder')}
                                mandatory
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
