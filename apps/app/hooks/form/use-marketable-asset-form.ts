'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import { CreateAssetRequestSchema, MarketableAssetFormSchema } from '@poveroh/schemas'
import type {
    AssetData,
    AssetTypeEnum,
    CreateAssetRequest,
    MarketableAssetForm,
    AssetMarketDataTypeEnum,
    CreateUpdateAssetRequest
} from '@poveroh/types'

type UseMarketableAssetFormProps = {
    initialData: AssetData | null
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTOCURRENCY'>
    defaultSymbol: string
}

export const useMarketableAssetForm = ({ initialData, assetType, defaultSymbol }: UseMarketableAssetFormProps) => {
    const { handleError } = useError()

    const [loading, setLoading] = useState(false)

    const defaultValues = useMemo<MarketableAssetForm>(
        () => ({
            transactionType: initialData ? (initialData.type as AssetMarketDataTypeEnum) : 'BUY',
            symbol: initialData ? initialData.marketable?.symbol || initialData.title : defaultSymbol,
            date: initialData?.currentValueAsOf?.split('T')[0] ?? '',
            quantity: 0, //initialData?.position?.quantity ?? 0,
            unitPrice: 0,
            fees: 0,
            currency: initialData?.currency ?? 'EUR'
        }),
        [defaultSymbol, initialData]
    )

    const form = useForm<MarketableAssetForm>({
        resolver: zodResolver(MarketableAssetFormSchema),
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

    const handleSubmit = async (
        values: MarketableAssetForm,
        dataCallback: (payload: CreateUpdateAssetRequest, files: File[]) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const asset = CreateAssetRequestSchema.parse({
                title: values.symbol,
                type: assetType,
                currency: values.currency,
                currentValue: total || null,
                currentValueAsOf: values.date,
                marketable: {
                    transactionType: values.transactionType,
                    symbol: values.symbol,
                    date: values.date,
                    quantity: values.quantity,
                    unitPrice: values.unitPrice,
                    fees: values.fees,
                    currency: values.currency
                }
            } satisfies CreateAssetRequest)

            await dataCallback(asset, [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    return {
        form,
        loading,
        currency,
        quantity,
        unitPrice,
        fees,
        total,
        defaultValues,
        handleSubmit
    }
}
