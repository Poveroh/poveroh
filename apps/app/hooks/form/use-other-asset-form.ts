'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import { CreateOtherAssetRequestSchema, OtherAssetFormSchema, UpdateOtherAssetRequestSchema } from '@poveroh/schemas'
import type { CreateOtherAssetRequest, UpdateOtherAssetRequest } from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'
import type { OtherAssetFormProps, OtherAssetFormValues } from '@/types'

/**
 * Builds the React Hook Form state for the other asset dialog, deriving defaults from the asset being edited.
 * @param props The form props carrying the initial asset, editing mode flag and submit callback.
 * @returns The form instance, computed default values and the submit handler.
 */
export const useOtherAssetForm = (props: OtherAssetFormProps) => {
    const { handleError } = useError()

    const { initialData } = props

    const defaultValues = useMemo<OtherAssetFormValues>(
        () => ({
            title: initialData?.title ?? '',
            value: initialData?.currentValue ?? 0,
            purchaseDate: initialData?.other?.purchaseDate?.split('T')[0] ?? '',
            description: initialData?.other?.description ?? ''
        }),
        [initialData]
    )

    const form = useForm<OtherAssetFormValues>({
        resolver: zodResolver(OtherAssetFormSchema),
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
        values: OtherAssetFormValues,
        dataCallback: (payload: CreateOtherAssetRequest | UpdateOtherAssetRequest, files: File[]) => Promise<void>
    ) => {
        try {
            const basePayload = {
                title: values.title,
                value: values.value,
                ...(values.purchaseDate ? { purchaseDate: values.purchaseDate } : {}),
                ...(values.description ? { description: values.description } : {})
            }

            const payload = props.inEditingMode
                ? UpdateOtherAssetRequestSchema.parse(basePayload)
                : CreateOtherAssetRequestSchema.parse(basePayload)

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
