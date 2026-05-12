'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Input } from '@poveroh/ui/components/input'
import { cn } from '@poveroh/ui/lib/utils'

import { AmountField, CurrencyField, DateField } from '@/components/fields'
import { useMarketableAssetForm } from '@/hooks/form/use-marketable-asset-form'
import type { FormProps, FormRef, MarketableAssetFormValues } from '@/types'
import {
    AssetTypeCatalog,
    type AssetData,
    type AssetTypeEnum,
    type MarketableAssetClassEnum,
    CreateUpdateAssetRequest
} from '@poveroh/types'
import { Tabs, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

type MarketableAssetFormProps = FormProps<AssetData, CreateUpdateAssetRequest> & {
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTOCURRENCY'>
    assetClass: Extract<MarketableAssetClassEnum, 'EQUITY' | 'CRYPTO'>
    defaultSymbol: string
}

export const MarketableAssetForm = forwardRef<FormRef, MarketableAssetFormProps>(
    (props: MarketableAssetFormProps, ref) => {
        const { initialData, assetType, defaultSymbol, dataCallback } = props

        const t = useTranslations()
        const { form, currency, quantity, unitPrice, fees, total, defaultValues, handleSubmit } =
            useMarketableAssetForm({
                initialData,
                assetType,
                defaultSymbol
            })

        useImperativeHandle(ref, () => ({
            submit: () => {
                form.handleSubmit(values => handleSubmit(values, dataCallback))()
            },
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
                    <FormField
                        control={form.control}
                        name='transactionType'
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Tabs defaultValue={field.value} value={field.value} onValueChange={field.onChange}>
                                        <TabsList className='grid w-full grid-cols-3'>
                                            {AssetTypeCatalog.map(item => (
                                                <TabsTrigger key={item.value} value={item.value.toString()}>
                                                    {item.label}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </Tabs>
                                    <div className='grid grid-cols-2 rounded-md bg-muted p-1'>
                                        {(['BUY', 'SELL'] as const).map(type => (
                                            <Button
                                                key={type}
                                                type='button'
                                                variant={field.value === type ? 'secondary' : 'ghost'}
                                                onClick={() => field.onChange(type)}
                                            >
                                                {t(`investments.assets.form.transactionType.${type.toLowerCase()}`)}
                                            </Button>
                                        ))}
                                    </div>
                                </FormControl>
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
                                        placeholder={defaultSymbol}
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

                    <div className='rounded-md bg-muted/50 px-6 py-3'>
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
                    </div>
                </form>
            </Form>
        )
    }
)

MarketableAssetForm.displayName = 'MarketableAssetForm'

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className='flex items-center justify-between border-b border-hr py-3 last:border-b-0'>
            <p className={cn(strong && 'font-semibold', !strong && 'text-muted-foreground')}>{label}</p>
            <p className={cn(strong && 'font-semibold')}>{value}</p>
        </div>
    )
}
