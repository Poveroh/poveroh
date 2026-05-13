'use client'

import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { useTranslations } from 'next-intl'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'

import { AmountField, CurrencyField, DateField } from '@/components/fields'
import { useMarketableAssetForm } from '@/hooks/form/use-marketable-asset-form'
import type { FormRef, MarketableAssetFormProps, MarketableAssetFormValues } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import { useAsset } from '@/hooks/use-asset'
import { SummaryRow } from '../investments/summary-row'
import Box from '../box/box-wrapper'

export const MarketableAssetForm = forwardRef<FormRef, MarketableAssetFormProps>(
    (props: MarketableAssetFormProps, ref) => {
        const t = useTranslations()
        const { ASSET_TYPE_CATALOG } = useAsset()
        const { form, currency, quantity, unitPrice, fees, total, defaultValues, onSubmit } =
            useMarketableAssetForm(props)

        useImperativeHandle(ref, () => ({
            submit: onSubmit,
            reset: () => {
                form.reset(defaultValues)
            }
        }))

        const summaryContent = useMemo(() => {
            return (
                <Box>
                    <SummaryRow
                        label={t('investments.assets.form.summary.unitPrice')}
                        value={`${currency} ${unitPrice.toFixed(2)}`}
                    />
                    <SummaryRow label={t('investments.assets.form.summary.quantity')} value={quantity.toString()} />
                    <SummaryRow
                        label={t('investments.assets.form.summary.fees')}
                        value={`${currency} ${fees.toFixed(2)}`}
                    />
                    <SummaryRow
                        label={t('investments.assets.form.summary.total')}
                        value={`${currency} ${total.toFixed(2)}`}
                        strong
                    />
                </Box>
            )
        }, [currency, quantity, unitPrice, fees, total])

        return (
            <Form {...form}>
                <form
                    className='flex flex-col space-y-6'
                    onSubmit={event => {
                        event.preventDefault()
                    }}
                >
                    <FormField
                        control={form.control}
                        name='transactionType'
                        render={({ field }) => (
                            <FormItem>
                                <Tabs defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                                    <TabsList className='grid w-full grid-cols-2'>
                                        {ASSET_TYPE_CATALOG.map(item => (
                                            <TabsTrigger key={item.value} value={item.value.toString()}>
                                                {item.label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='symbol'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel mandatory>{t('investments.assets.form.symbol.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        variant='contained'
                                        placeholder={props.defaultSymbol}
                                        onChange={event => {
                                            const symbol = event.target.value.toUpperCase()
                                            field.onChange(symbol)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DateField<MarketableAssetFormValues>
                        control={form.control}
                        name='date'
                        label={t('form.date.label')}
                        mandatory
                    />

                    <div className='grid grid-cols-2 gap-3'>
                        <AmountField<MarketableAssetFormValues>
                            control={form.control}
                            name='quantity'
                            label={t('investments.assets.form.quantity.label')}
                            placeholder='0.00'
                            step='0.000001'
                            mandatory
                        />
                        <AmountField<MarketableAssetFormValues>
                            control={form.control}
                            name='unitPrice'
                            label={t('investments.assets.form.unitPrice.label')}
                            placeholder='0.00'
                            mandatory
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <AmountField<MarketableAssetFormValues>
                            control={form.control}
                            name='fees'
                            label={t('investments.assets.form.fees.label')}
                            placeholder='0.00'
                        />
                        <CurrencyField<MarketableAssetFormValues>
                            control={form.control}
                            name='currency'
                            label={t('form.currency.label')}
                            placeholder={t('form.currency.placeholder')}
                            mandatory
                        />
                    </div>

                    {summaryContent}
                </form>
            </Form>
        )
    }
)

MarketableAssetForm.displayName = 'MarketableAssetForm'
