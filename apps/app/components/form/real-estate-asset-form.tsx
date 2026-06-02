'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'
import { REAL_ESTATE_TYPE_CATALOG } from '@poveroh/types'

import { AmountField, DateField, SelectField, TextField } from '@/components/fields'
import { useRealEstateAssetForm } from '@/hooks/form/use-real-estate-asset-form'
import type { FormRef, RealEstateAssetFormProps } from '@/types'

export const RealEstateAssetForm = forwardRef<FormRef, RealEstateAssetFormProps>(
    (props: RealEstateAssetFormProps, ref) => {
        const t = useTranslations()
        const { form, defaultValues, onSubmit } = useRealEstateAssetForm(props)

        useImperativeHandle(ref, () => ({
            submit: onSubmit,
            reset: () => {
                form.reset(defaultValues)
            }
        }))

        return (
            <Form {...form}>
                <form
                    className='flex flex-col space-y-6'
                    onSubmit={event => {
                        event.preventDefault()
                    }}
                >
                    <TextField
                        control={form.control}
                        name='title'
                        label={t('investments.assets.form.name.label')}
                        mandatory
                    />

                    <SelectField
                        control={form.control}
                        name='type'
                        label={t('investments.assets.form.realEstateType.label')}
                        placeholder={t('investments.assets.form.realEstateType.placeholder')}
                        options={REAL_ESTATE_TYPE_CATALOG}
                        getOptionLabel={option => t(option.label)}
                        getOptionValue={option => option.value}
                        mandatory
                    />

                    <AmountField
                        control={form.control}
                        name='value'
                        label={t('investments.assets.form.value.label')}
                        placeholder='0.00'
                        mandatory
                    />

                    <div className='grid grid-cols-2 gap-3'>
                        <DateField
                            control={form.control}
                            name='purchaseDate'
                            label={t('investments.assets.form.purchaseDate.label')}
                        />
                        <TextField
                            control={form.control}
                            name='address'
                            label={t('investments.assets.form.address.label')}
                        />
                    </div>
                </form>
            </Form>
        )
    }
)

RealEstateAssetForm.displayName = 'RealEstateAssetForm'
