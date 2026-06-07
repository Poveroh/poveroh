'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form } from '@poveroh/ui/components/form'

import { AmountField, DateField, TextField } from '@/components/fields'
import { useCollectibleAssetForm } from '@/hooks/form/use-collectible-asset-form'
import type { CollectibleAssetFormProps, FormRef } from '@/types'

export const CollectibleAssetForm = forwardRef<FormRef, CollectibleAssetFormProps>(
    (props: CollectibleAssetFormProps, ref) => {
        const t = useTranslations()
        const { form, defaultValues, onSubmit } = useCollectibleAssetForm(props)

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
                            name='acquisitionDate'
                            label={t('investments.assets.form.acquisitionDate.label')}
                        />
                        <AmountField
                            control={form.control}
                            name='appraisalValue'
                            label={t('investments.assets.form.appraisalValue.label')}
                            placeholder='0.00'
                        />
                    </div>

                    <DateField
                        control={form.control}
                        name='appraisalDate'
                        label={t('investments.assets.form.appraisalDate.label')}
                    />
                </form>
            </Form>
        )
    }
)

CollectibleAssetForm.displayName = 'CollectibleAssetForm'
