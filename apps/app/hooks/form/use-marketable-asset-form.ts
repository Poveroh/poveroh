'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import {
    CreateMarketableAssetRequestSchema,
    MarketableAssetFormSchema,
    UpdateMarketableAssetRequestSchema
} from '@poveroh/schemas'
import type { MarketableAssetForm, CreateMarketableAssetRequest, UpdateMarketableAssetRequest } from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'
import { MarketableAssetFormProps } from '@/types'

export const useMarketableAssetForm = (props: MarketableAssetFormProps) => {
    const { handleError } = useError()

    const { initialData, defaultSymbol } = props

    const [loading, setLoading] = useState(false)

    const openingTransaction = useMemo(() => {
        if (!initialData?.transactions?.length) return null

        return [...initialData.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    }, [initialData])

    const defaultValues = useMemo<MarketableAssetForm>(
        () => ({
            transactionType: openingTransaction?.type === 'SELL' ? 'SELL' : 'BUY',
            financialAccountId: openingTransaction?.financialAccountId ?? '',
            symbol: initialData ? initialData.marketable?.symbol || initialData.title : defaultSymbol,
            providerId: initialData?.marketable?.providerId ?? undefined,
            providerInstrumentId: initialData?.marketable?.providerInstrumentId ?? undefined,
            date: initialData?.currentValueAsOf?.split('T')[0] ?? new Date().toISOString(),
            quantity: openingTransaction?.quantityChange ?? 0,
            unitPrice: openingTransaction?.unitPrice ?? 0,
            fees: openingTransaction?.fees ?? 0,
            currency: initialData?.currency ?? 'EUR'
        }),
        [defaultSymbol, initialData, openingTransaction]
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
        dataCallback: (
            payload: CreateMarketableAssetRequest | UpdateMarketableAssetRequest,
            files: File[]
        ) => Promise<void>
    ) => {
        try {
            setLoading(true)

            const basePayload = {
                title: values.symbol,
                currency: values.currency,
                currentValue: total,
                currentValueAsOf: values.date,
                symbol: values.symbol
            }

            const payload = props.inEditingMode
                ? UpdateMarketableAssetRequestSchema.parse(basePayload)
                : CreateMarketableAssetRequestSchema.parse({
                      ...basePayload,
                      assetClass: values.assetClass,
                      financialAccountId: values.financialAccountId,
                      providerId: values.providerId,
                      providerInstrumentId: values.providerInstrumentId,
                      transactionType: values.transactionType,
                      date: values.date,
                      quantity: values.quantity,
                      unitPrice: values.unitPrice,
                      fees: values.fees
                  })

            await dataCallback(payload, [])
        } catch (error) {
            handleError(error, 'Form error')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = form.handleSubmit(
        values => handleSubmit(values, props.dataCallback),
        errors => {
            if (Object.keys(errors).length > 0) {
                logger.error('Form validation errors on submit:', errors)
            }
        }
    )

    return {
        form,
        loading,
        currency,
        quantity,
        unitPrice,
        fees,
        total,
        defaultValues,
        onSubmit
    }
}
