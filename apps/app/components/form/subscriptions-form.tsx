'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { AppearanceMode, CyclePeriod, ISubscription, RememberPeriod } from '@poveroh/types'

import { useAccount } from '@/hooks/use-account'
import { useSubscriptionForm } from '@/hooks/form/use-subscription-form'
import { iconList } from '../icon'
import {
    TextField,
    AmountField,
    CurrencyField,
    DateField,
    AccountField,
    SelectField,
    NoteField,
    IconField
} from '../fields'
import { Form } from '@poveroh/ui/components/form'
import { FormRef } from '@/types'

type FormProps = {
    fromTemplate: boolean
    initialData?: ISubscription | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
    closeDialog: () => void
}

export const SubscriptionForm = forwardRef<FormRef, FormProps>((props: FormProps, ref) => {
    const t = useTranslations()

    const { initialData, inEditingMode, fromTemplate, dataCallback } = props

    const { accountCacheList } = useAccount()

    const { form, icon, iconError, submitForm, handleIconChange } = useSubscriptionForm({
        initialData,
        inEditingMode,
        dataCallback
    })

    useImperativeHandle(ref, () => ({
        submit: () => {
            submitForm()
        }
    }))

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <TextField control={form.control} name='title' label={t('form.title.label')} mandatory={true} />

                    <div className='flex flex-row space-x-2'>
                        <AmountField
                            control={form.control}
                            name='amount'
                            label={t('form.amount.label')}
                            placeholder={t('form.amount.placeholder')}
                            mandatory={true}
                        />

                        <CurrencyField
                            control={form.control}
                            name='currency'
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            mandatory={true}
                        />
                    </div>

                    <DateField
                        control={form.control}
                        name='firstPayment'
                        label={t('form.first_payment.label')}
                        mandatory={true}
                    />

                    <div className='flex flex-row space-x-2'>
                        <div className='w-[30%]'>
                            <SelectField
                                control={form.control}
                                name='cycleNumber'
                                label={t('form.cycle_number.label')}
                                mandatory={true}
                                options={Array.from({ length: 31 }, (_, i) => ({
                                    label: (i + 1).toString(),
                                    value: (i + 1).toString()
                                }))}
                                getOptionLabel={option => option.label}
                                getOptionValue={option => option.value}
                            />
                        </div>

                        <SelectField
                            control={form.control}
                            name='cyclePeriod'
                            label={t('form.cycle_period.label')}
                            mandatory={true}
                            options={Object.values(CyclePeriod).map(period => ({
                                label: t(`format.${period.toLowerCase()}`),
                                value: period
                            }))}
                            getOptionLabel={option => option.label}
                            getOptionValue={option => option.value}
                        />
                    </div>

                    <AccountField
                        control={form.control}
                        name='accountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                        accounts={Object.values(accountCacheList)}
                    />

                    {!fromTemplate && (
                        <IconField
                            label={t('form.icon.label')}
                            iconList={iconList}
                            selectedIcon={icon}
                            onIconChange={handleIconChange}
                            mandatory={!inEditingMode}
                            showError={iconError}
                            errorMessage={t('messages.errors.required')}
                        />
                    )}

                    <SelectField
                        control={form.control}
                        name='rememberPeriod'
                        label={t('form.remember_period.label')}
                        mandatory={false}
                        options={Object.values(RememberPeriod).map(period => ({
                            label: t(`reminderPeriod.${period.toLowerCase()}`),
                            value: period
                        }))}
                        getOptionLabel={option => option.label}
                        getOptionValue={option => option.value}
                    />

                    <NoteField
                        control={form.control}
                        name='description'
                        label={t('form.description.label')}
                        placeholder={t('form.description.placeholder')}
                        mandatory={false}
                    />
                </div>
            </form>
        </Form>
    )
})

SubscriptionForm.displayName = 'SubscriptionForm'
