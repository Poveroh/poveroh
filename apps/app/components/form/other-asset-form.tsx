'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'

import { AmountField, DateField, TextField } from '@/components/fields'
import { useOtherAssetForm } from '@/hooks/form/use-other-asset-form'
import type { FormRef, OtherAssetFormProps } from '@/types'

export const OtherAssetForm = forwardRef<FormRef, OtherAssetFormProps>((props: OtherAssetFormProps, ref) => {
    const t = useTranslations()
    const { form, defaultValues, onSubmit } = useOtherAssetForm(props)

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
                        name='description'
                        label={t('investments.assets.form.description.label')}
                    />
                </div>
            </form>
        </Form>
    )
})

OtherAssetForm.displayName = 'OtherAssetForm'
