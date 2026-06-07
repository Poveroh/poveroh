'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import {
    CollectibleAssetFormSchema,
    CreateCollectibleAssetRequestSchema,
    UpdateCollectibleAssetRequestSchema
} from '@poveroh/schemas'
import type { CreateCollectibleAssetRequest, UpdateCollectibleAssetRequest } from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'
import type { CollectibleAssetFormProps, CollectibleAssetFormValues } from '@/types'

/**
 * Builds the React Hook Form state for the collectible asset dialog, deriving defaults from the asset being edited.
 * @param props The form props carrying the initial asset, editing mode flag and submit callback.
 * @returns The form instance, computed default values and the submit handler.
 */
export const useCollectibleAssetForm = (props: CollectibleAssetFormProps) => {
    const { handleError } = useError()

    const { initialData } = props

    const defaultValues = useMemo<CollectibleAssetFormValues>(
        () => ({
            title: initialData?.title ?? '',
            value: initialData?.currentValue ?? 0,
            acquisitionDate: initialData?.collectible?.acquisitionDate?.split('T')[0] ?? '',
            appraisalValue: initialData?.collectible?.appraisalValue ?? undefined,
            appraisalDate: initialData?.collectible?.appraisalDate?.split('T')[0] ?? ''
        }),
        [initialData]
    )

    const form = useForm<CollectibleAssetFormValues>({
        resolver: zodResolver(CollectibleAssetFormSchema),
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
        values: CollectibleAssetFormValues,
        dataCallback: (
            payload: CreateCollectibleAssetRequest | UpdateCollectibleAssetRequest,
            files: File[]
        ) => Promise<void>
    ) => {
        try {
            const basePayload = {
                title: values.title,
                value: values.value,
                ...(values.acquisitionDate ? { acquisitionDate: values.acquisitionDate } : {}),
                ...(values.appraisalValue ? { appraisalValue: values.appraisalValue } : {}),
                ...(values.appraisalDate ? { appraisalDate: values.appraisalDate } : {})
            }

            const payload = props.inEditingMode
                ? UpdateCollectibleAssetRequestSchema.parse(basePayload)
                : CreateCollectibleAssetRequestSchema.parse(basePayload)

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
