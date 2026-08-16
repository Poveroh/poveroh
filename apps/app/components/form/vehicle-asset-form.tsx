'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Form, FormControl, FormField, FormItem } from '@poveroh/ui/components/form'
import { Switch } from '@poveroh/ui/components/switch'
import { VEHICLE_TYPE_CATALOG, DEPRECIATION_CYCLE_CATALOG } from '@poveroh/types'

import { AmountField, DateField, SelectField, TextField } from '@/components/fields'
import { PopoverIconLogo } from '@/components/fields/popover-icon-logo'
import { useVehicleAssetForm } from '@/hooks/form/use-vehicle-asset-form'
import type { FormRef, VehicleAssetFormProps } from '@/types'
import { NumberField } from '../fields/number-field'

export const VehicleAssetForm = forwardRef<FormRef, VehicleAssetFormProps>((props: VehicleAssetFormProps, ref) => {
    const t = useTranslations()
    const { form, setFile, enableDepreciation, defaultValues, onSubmit } = useVehicleAssetForm(props)

    useImperativeHandle(ref, () => ({
        submit: onSubmit,
        reset: () => {
            form.reset(defaultValues)
            setFile([])
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
                <div className='flex flex-row items-end space-x-7'>
                    <PopoverIconLogo
                        control={form.control}
                        logoUrl={props.initialData?.vehicle?.logoIcon ?? undefined}
                        onFileChange={setFile}
                        enableIcon={false}
                        enableLogo={true}
                        inEditingMode={props.inEditingMode}
                    />

                    <div className='grid grid-cols-2 gap-3 grow'>
                        <TextField control={form.control} name='brand' label={t('form.brand.label')} mandatory />
                        <TextField control={form.control} name='model' label={t('form.model.label')} mandatory />
                    </div>
                </div>

                <SelectField
                    control={form.control}
                    name='type'
                    label={t('form.vehicleType.label')}
                    placeholder={t('form.vehicleType.placeholder')}
                    options={VEHICLE_TYPE_CATALOG}
                    getOptionLabel={option => t(option.label)}
                    getOptionValue={option => option.value}
                    mandatory
                />

                <AmountField
                    control={form.control}
                    name='value'
                    label={t('form.value.label')}
                    placeholder='0.00'
                    mandatory
                />

                <div className='grid grid-cols-3 gap-3'>
                    <DateField control={form.control} name='purchaseDate' label={t('form.purchaseDate.label')} />
                    <NumberField
                        control={form.control}
                        name='year'
                        label={t('form.vehicleYear.label')}
                        placeholder={t('form.vehicleYear.placeholder')}
                        step='1'
                    />
                    <TextField control={form.control} name='plateNumber' label={t('form.plate.label')} />
                </div>

                <hr className='border-border' />

                <FormField
                    control={form.control}
                    name='enableDepreciation'
                    render={({ field }) => (
                        <FormItem className='flex flex-col space-y-1'>
                            <div className='flex flex-row items-center space-x-3'>
                                <span className='font-medium'>{t('form.depreciation.toggle')}</span>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </div>
                            <p className='text-sm text-muted-foreground'>{t('form.depreciation.description')}</p>
                        </FormItem>
                    )}
                />

                {enableDepreciation && (
                    <div className='grid grid-cols-2 gap-3'>
                        <NumberField
                            control={form.control}
                            name='depreciationPercentage'
                            label={t('form.depreciation.percentage.label')}
                            placeholder='0.00'
                            step='0.01'
                        />
                        <SelectField
                            control={form.control}
                            name='depreciationCycle'
                            label={t('form.depreciation.every.label')}
                            placeholder={t('form.depreciation.every.placeholder')}
                            options={DEPRECIATION_CYCLE_CATALOG}
                            getOptionLabel={option => t(option.label)}
                            getOptionValue={option => option.value}
                        />
                    </div>
                )}
            </form>
        </Form>
    )
})

VehicleAssetForm.displayName = 'VehicleAssetForm'
