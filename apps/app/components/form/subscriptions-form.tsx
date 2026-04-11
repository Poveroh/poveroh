'use client'

import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { useSubscriptionForm } from '@/hooks/form/use-subscription-form'
import {
    TextField,
    AmountField,
    CurrencyField,
    DateField,
    AccountField,
    SelectField,
    NoteField,
    PopoverIconLogo
} from '../fields'
import { Form } from '@poveroh/ui/components/form'
import { FormProps, FormRef } from '@/types'
import { useUtils } from '@/hooks/use-utils'
import {
    CreateUpdateSubscriptionRequest,
    SubscriptionData,
    CyclePeriodCatalog,
    RememberPeriodCatalog,
    Item
} from '@poveroh/types'
import { useWatch } from 'react-hook-form'

type SubscriptionFormProps = FormProps<SubscriptionData, CreateUpdateSubscriptionRequest>

export const SubscriptionForm = forwardRef<FormRef, SubscriptionFormProps>((props: SubscriptionFormProps, ref) => {
    const { initialData, dataCallback } = props

    const t = useTranslations()
    const { renderItemsLabel } = useUtils()
    const { form, icon, handleIconChange, handleFileChange, handleSubmit } = useSubscriptionForm(initialData)

    const color = useWatch({ control: form.control, name: 'appearanceIconColor' })

    useImperativeHandle(ref, () => ({
        submit: () => {
            form.handleSubmit(values => handleSubmit(values, dataCallback))()
        },
        reset: () => {
            form.reset()
        }
    }))

    const DAYS = useMemo(() => {
        return Array.from({ length: 31 }, (_, i) => ({
            label: (i + 1).toString(),
            value: (i + 1).toString()
        })) as Item<string>[]
    }, [])

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                }}
            >
                <div className='flex flex-col space-y-6'>
                    <div className='flex flex-row items-center space-x-7'>
                        <PopoverIconLogo
                            control={form.control}
                            logoUrl={initialData?.appearanceLogoIcon}
                            colorFieldName='appearanceIconColor'
                            selectedIcon={icon}
                            selectedColor={color || initialData?.appearanceIconColor}
                            onFileChange={handleFileChange}
                            onIconChange={handleIconChange}
                            enableIcon={true}
                            enableLogo={true}
                        />

                        <TextField control={form.control} name='title' label={t('form.title.label')} mandatory={true} />
                    </div>

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
                                options={DAYS}
                                getOptionLabel={option => option.label}
                                getOptionValue={option => option.value}
                                formatValue={value => (value ? String(value) : '')}
                                parseValue={value => Number(value)}
                            />
                        </div>

                        <SelectField
                            control={form.control}
                            name='cyclePeriod'
                            label={t('form.cycle_period.label')}
                            mandatory={true}
                            options={renderItemsLabel(CyclePeriodCatalog)}
                            getOptionLabel={option => option.label}
                            getOptionValue={option => option.value}
                        />
                    </div>

                    <AccountField
                        control={form.control}
                        name='financialAccountId'
                        label={t('form.account.label')}
                        placeholder={t('form.account.placeholder')}
                        mandatory={true}
                    />

                    <SelectField
                        control={form.control}
                        name='rememberPeriod'
                        label={t('form.remember_period.label')}
                        mandatory={false}
                        options={renderItemsLabel(RememberPeriodCatalog)}
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
