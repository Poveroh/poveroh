'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useError } from '@/hooks/use-error'
import {
    CreateVehicleAssetRequestSchema,
    UpdateVehicleAssetRequestSchema,
    VehicleAssetFormSchema
} from '@poveroh/schemas'
import {
    DEPRECIATION_CYCLE_CATALOG,
    type CreateVehicleAssetRequest,
    type UpdateVehicleAssetRequest
} from '@poveroh/types'
import { logger } from '@poveroh/logger/browser'
import { z } from 'zod'
import type { VehicleAssetFormProps, VehicleAssetFormValues } from '@/types'

// The resolver mirrors the vehicle contract form, but swaps the nested autoDepreciation object for
// the flat UI controls (toggle + cadence preset + percentage) that the dialog actually renders.
const VehicleFormResolverSchema = VehicleAssetFormSchema.omit({ autoDepreciation: true }).extend({
    enableDepreciation: z.boolean(),
    depreciationCycle: z.string().optional(),
    depreciationPercentage: z.number().positive().optional()
})

/**
 * Builds the React Hook Form state for the vehicle asset dialog, deriving defaults from the asset being edited and tracking the uploaded brand logo.
 * @param props The form props carrying the initial asset, editing mode flag and submit callback.
 * @returns The form instance, logo file state and the submit handler.
 */
export const useVehicleAssetForm = (props: VehicleAssetFormProps) => {
    const { handleError } = useError()

    const { initialData } = props

    const [file, setFile] = useState<File[]>([])

    const existingDepreciation = useMemo(() => {
        const depreciation = initialData?.autoDepreciations?.[0]
        if (!depreciation) return undefined

        const cycle = DEPRECIATION_CYCLE_CATALOG.find(
            option => option.cyclePeriod === depreciation.cyclePeriod && option.cycleNumber === depreciation.cycleNumber
        )

        return { cycle: cycle?.value, percentage: depreciation.depreciationValue }
    }, [initialData])

    const defaultValues = useMemo<VehicleAssetFormValues>(
        () => ({
            brand: initialData?.vehicle?.brand ?? '',
            model: initialData?.vehicle?.model ?? '',
            type: initialData?.vehicle?.type ?? 'CAR',
            value: initialData?.currentValue ?? 0,
            purchaseDate: initialData?.vehicle?.purchaseDate?.split('T')[0] ?? '',
            year: initialData?.vehicle?.year,
            plateNumber: initialData?.vehicle?.plateNumber ?? '',
            logoIcon: initialData?.vehicle?.logoIcon ?? '',
            enableDepreciation: Boolean(existingDepreciation),
            depreciationCycle: existingDepreciation?.cycle,
            depreciationPercentage: existingDepreciation?.percentage
        }),
        [initialData, existingDepreciation]
    )

    const form = useForm<VehicleAssetFormValues>({
        resolver: zodResolver(VehicleFormResolverSchema),
        defaultValues
    })

    useEffect(() => {
        form.reset(defaultValues)
    }, [defaultValues, form])

    const enableDepreciation = form.watch('enableDepreciation')

    /**
     * Normalizes the raw form values into a request payload, folding the flat depreciation controls back into the nested autoDepreciation object, then delegates to the dialog callback.
     * @param values The validated form values.
     * @param dataCallback The dialog callback that performs the create or update request.
     */
    const handleSubmit = async (
        values: VehicleAssetFormValues,
        dataCallback: (payload: CreateVehicleAssetRequest | UpdateVehicleAssetRequest, files: File[]) => Promise<void>
    ) => {
        try {
            const cycle = DEPRECIATION_CYCLE_CATALOG.find(option => option.value === values.depreciationCycle)
            const autoDepreciation =
                values.enableDepreciation && cycle && values.depreciationPercentage
                    ? {
                          percentage: values.depreciationPercentage,
                          cyclePeriod: cycle.cyclePeriod,
                          cycleNumber: cycle.cycleNumber
                      }
                    : undefined

            const basePayload = {
                brand: values.brand,
                model: values.model,
                type: values.type,
                value: values.value,
                ...(values.purchaseDate ? { purchaseDate: values.purchaseDate } : {}),
                ...(values.year ? { year: values.year } : {}),
                ...(values.plateNumber ? { plateNumber: values.plateNumber } : {}),
                ...(values.logoIcon ? { logoIcon: values.logoIcon } : {}),
                ...(autoDepreciation ? { autoDepreciation } : {})
            }

            const payload = props.inEditingMode
                ? UpdateVehicleAssetRequestSchema.parse(basePayload)
                : CreateVehicleAssetRequestSchema.parse(basePayload)

            await dataCallback(payload, file ? Array.from(file) : [])
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
        file,
        setFile,
        enableDepreciation,
        defaultValues,
        onSubmit
    }
}
