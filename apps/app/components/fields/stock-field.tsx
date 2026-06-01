'use client'

import { useState } from 'react'
import { FieldValues, Path } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { ChevronsUpDown, Loader2, Search } from 'lucide-react'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@poveroh/ui/components/form'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Input } from '@poveroh/ui/components/input'
import { Badge } from '@poveroh/ui/components/badge'
import { cn } from '@poveroh/ui/lib/utils'
import { MarketInstrument } from '@poveroh/types'

import { StockFieldProps } from '@/types'
import { useMarketInstrumentSearch } from '@/hooks/use-market-instrument-search'

export function StockField<T extends FieldValues = FieldValues>({
    control,
    name = 'symbol' as Path<T>,
    label,
    placeholder,
    variant = 'contained',
    disabled = false,
    mandatory = false,
    providerId,
    assetType,
    onValueChange,
    onInstrumentSelect
}: StockFieldProps<T>) {
    const t = useTranslations()
    const [open, setOpen] = useState(false)
    const { query, setQuery, instruments, isFetching, isError, minQueryLength } = useMarketInstrumentSearch({
        providerId,
        assetType
    })

    return (
        <FormField
            control={control}
            name={name!}
            render={({ field }) => {
                const handleSelect = (instrument: MarketInstrument) => {
                    field.onChange(instrument.symbol)
                    onValueChange?.(instrument.symbol as T[Path<T>])
                    onInstrumentSelect?.(instrument)
                    setOpen(false)
                }

                return (
                    <FormItem className='flex flex-col'>
                        {label && <FormLabel mandatory={mandatory}>{label}</FormLabel>}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild disabled={disabled}>
                                <FormControl>
                                    <button
                                        type='button'
                                        disabled={disabled}
                                        className={cn(
                                            `flex h-11 w-full items-center justify-between rounded-md border ${variant === 'contained' ? 'border-input' : 'border-white'} bg-input px-4 py-4 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                                            !field.value && 'text-muted-foreground'
                                        )}
                                    >
                                        <span className='line-clamp-1'>
                                            {field.value || placeholder || t('stockField.placeholder')}
                                        </span>
                                        <ChevronsUpDown className='h-4 w-4 opacity-50' />
                                    </button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                                <div className='p-2'>
                                    <Input
                                        autoFocus
                                        startIcon={Search}
                                        value={query}
                                        onChange={event => setQuery(event.target.value)}
                                        placeholder={t('stockField.placeholder')}
                                    />
                                </div>
                                <div className='max-h-72 overflow-y-auto p-1'>
                                    {isFetching && (
                                        <div className='flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            {t('stockField.searching')}
                                        </div>
                                    )}

                                    {!isFetching && query.trim().length < minQueryLength && (
                                        <div className='px-3 py-2 text-sm text-muted-foreground'>
                                            {t('stockField.minChars', { count: minQueryLength })}
                                        </div>
                                    )}

                                    {!isFetching &&
                                        query.trim().length >= minQueryLength &&
                                        instruments.length === 0 && (
                                            <div className='px-3 py-2 text-sm text-muted-foreground'>
                                                {isError ? t('stockField.error') : t('stockField.noResults')}
                                            </div>
                                        )}

                                    {!isFetching &&
                                        instruments.map(instrument => (
                                            <button
                                                key={`${instrument.providerId}-${instrument.providerInstrumentId}`}
                                                type='button'
                                                onClick={() => handleSelect(instrument)}
                                                className='flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent'
                                            >
                                                <div className='flex min-w-0 flex-col'>
                                                    <span className='font-medium'>{instrument.symbol}</span>
                                                    <span className='line-clamp-1 text-xs text-muted-foreground'>
                                                        {instrument.displayName}
                                                    </span>
                                                </div>
                                                <div className='flex shrink-0 items-center gap-2'>
                                                    {instrument.exchange && (
                                                        <span className='text-xs text-muted-foreground'>
                                                            {instrument.exchange}
                                                        </span>
                                                    )}
                                                    <Badge variant='secondary'>{instrument.assetType}</Badge>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}
