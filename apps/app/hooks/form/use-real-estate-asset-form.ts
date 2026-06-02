'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import {
    CreateRealEstateAssetRequestSchema,
    RealEstateAssetFormSchema,
    UpdateRealEstateAssetRequestSchema
} from '@poveroh/schemas'
import type { CreateRealEstateAssetRequest, UpdateRealEstateAssetRequest } from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'
import type { RealEstateAssetFormProps, RealEstateAssetFormValues } from '@/types'

/**
 * Builds the React Hook Form state for the real estate asset dialog, deriving defaults from the asset being edited.
 * @param props The form props carrying the initial asset, editing mode flag and submit callback.
 * @returns The form instance, computed default values and the submit handler.
 */
export const useRealEstateAssetForm = (props: RealEstateAssetFormProps) => {
    const { handleError } = useError()

    const { initialData } = props

    const defaultValues = useMemo<RealEstateAssetFormValues>(
        () => ({
            title: initialData?.title ?? '',
            type: initialData?.realEstate?.type ?? 'PRIMARY_HOUSE',
            value: initialData?.currentValue ?? 0,
            purchaseDate: initialData?.realEstate?.purchaseDate?.split('T')[0] ?? '',
            address: initialData?.realEstate?.address ?? ''
        }),
        [initialData]
    )

    const form = useForm<RealEstateAssetFormValues>({
        resolver: zodResolver(RealEstateAssetFormSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(defaultValues)
    }, [defaultValues, form])

    /**
     * Normalizes the raw form values into a request payload, dropping empty optional fields, then delegates to the dialog callback.
     * @param values The validated form values.
     * @param dataCallback The dialog callback that performs the create or update request.
     */
    const handleSubmit = async (
        values: RealEstateAssetFormValues,
        dataCallback: (
            payload: CreateRealEstateAssetRequest | UpdateRealEstateAssetRequest,
            files: File[]
        ) => Promise<void>
    ) => {
        try {
            const basePayload = {
                title: values.title,
                type: values.type,
                value: values.value,
                ...(values.purchaseDate ? { purchaseDate: values.purchaseDate } : {}),
                ...(values.address ? { address: values.address } : {})
            }

            const payload = props.inEditingMode
                ? UpdateRealEstateAssetRequestSchema.parse(basePayload)
                : CreateRealEstateAssetRequestSchema.parse(basePayload)

            await dataCallback(payload, [])
        } catch (error) {
            handleError(error, 'Form error')
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
        defaultValues,
        onSubmit
    }
}
