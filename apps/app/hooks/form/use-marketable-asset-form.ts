'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useError } from '@/hooks/use-error'
import { CreateAssetRequestSchema } from '@poveroh/schemas'
import type {
    AssetData,
    AssetTypeEnum,
    CreateAssetRequest,
    MarketableAssetClassEnum,
    MarketableAsset
} from '@poveroh/types'
import type { MarketableAssetFormValues, MarketableAssetSubmitPayload } from '@/types'

type UseMarketableAssetFormConfig = {
    initialData: AssetData | null
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTOCURRENCY'>
    assetClass: Extract<MarketableAssetClassEnum, 'EQUITY' | 'CRYPTO'>
    defaultSymbol: string
}

const marketableAssetFormSchema = z.object({
    transactionType: z.enum(['BUY', 'SELL']),
    symbol: z.string().trim().min(1),
    title: z.string().trim().min(1),
    date: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    fees: z.number().min(0),
    currency: z.enum([
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'CNY',
        'INR',
        'AUD',
        'CAD',
        'CHF',
        'SEK',
        'NZD',
        'MXN',
        'SGD',
        'HKD',
        'NOK',
        'KRW',
        'TRY',
        'UNKNOWN'
    ])
})

const toIsoDateOrNull = (value: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null)

// Keeps edited market data compatible with older API responses where subtype fields may be nullable.
const getSymbol = (marketable?: MarketableAsset) => marketable?.symbol ?? ''

export const useMarketableAssetForm = ({
    initialData,
    assetType,
    assetClass,
    defaultSymbol
}: UseMarketableAssetFormConfig) => {
    const { handleError } = useError()

    const defaultValues = useMemo<MarketableAssetFormValues>(
        () => ({
            transactionType: 'BUY',
            symbol: initialData ? getSymbol(initialData.marketable) || initialData.title : defaultSymbol,
            title: initialData?.title ?? defaultSymbol,
            date: initialData?.currentValueAsOf?.split('T')[0] ?? '',
            quantity: initialData?.position?.quantity ?? 0,
            unitPrice: initialData?.position?.averageCost ?? 0,
            fees: 0,
            currency: initialData?.currency ?? 'EUR'
        }),
        [defaultSymbol, initialData]
    )

    const form = useForm<MarketableAssetFormValues>({
        resolver: zodResolver(marketableAssetFormSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(defaultValues)
    }, [defaultValues, form])

    const quantity = form.watch('quantity') || 0
    const unitPrice = form.watch('unitPrice') || 0
    const fees = form.watch('fees') || 0
    const currency = form.watch('currency')
    const total = quantity * unitPrice + fees

    // Builds the two API payloads while the dialog keeps responsibility for persistence order.
    const handleSubmit = async (
        values: MarketableAssetFormValues,
        dataCallback: (payload: MarketableAssetSubmitPayload, files: File[]) => Promise<void>
    ) => {
        try {
            const currentValueAsOf = toIsoDateOrNull(values.date)
            const asset = CreateAssetRequestSchema.parse({
                title: values.title || values.symbol,
                type: assetType,
                currency: values.currency,
                currentValue: total || null,
                currentValueAsOf,
                marketable: {
                    symbol: values.symbol,
                    isin: null,
                    exchange: null,
                    assetClass,
                    sector: null,
                    region: null,
                    lastPriceSync: null
                }
            } satisfies CreateAssetRequest)

            await dataCallback(
                {
                    asset,
                    transaction: {
                        type: values.transactionType,
                        date: currentValueAsOf ?? new Date().toISOString(),
                        settlementDate: null,
                        quantityChange: values.transactionType === 'BUY' ? values.quantity : -values.quantity,
                        unitPrice: values.unitPrice,
                        totalAmount: total,
                        currency: values.currency,
                        fxRate: null,
                        fees: values.fees,
                        taxAmount: null,
                        financialAccountId: null,
                        note: null
                    }
                },
                []
            )
        } catch (error) {
            handleError(error, 'Form error')
        }
    }

    return {
        form,
        currency,
        quantity,
        unitPrice,
        fees,
        total,
        defaultValues,
        handleSubmit
    }
}
