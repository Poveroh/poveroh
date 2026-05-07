'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@poveroh/ui/components/input'
import { Switch } from '@poveroh/ui/components/switch'
import { toast } from '@poveroh/ui/components/sonner'

import {
    FieldLabel,
    SelectInput,
    toIsoDateOrNull,
    toNumberOrNull,
    vehicleOptions
} from '@/components/dialog/investment/investment-dialog-fields'
import type { VehicleFormState } from '@/components/dialog/investment/investment-dialog-fields'
import Modal from '@/components/modal/modal'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import { CreateAssetRequestSchema } from '@poveroh/schemas'
import type { AssetData, CreateAssetRequest } from '@poveroh/types'

export function VehicleAssetDialog() {
    const t = useTranslations()
    const modalManager = useModal<AssetData>(MODAL_IDS.VEHICLE_DIALOG)
    const { createMutation } = useAsset()
    const { handleError } = useError()
    const formRef = useRef<HTMLFormElement | null>(null)
    const [form, setForm] = useState<VehicleFormState>({
        brand: '',
        model: '',
        type: 'CAR',
        currentValue: '',
        purchaseDate: '',
        year: '',
        plateNumber: '',
        autoDepreciation: false,
        depreciationPercentage: '',
        depreciationEvery: '',
        currency: 'EUR'
    })

    const updateField = <K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) => {
        setForm(current => ({ ...current, [key]: value }))
    }

    const submitForm = async () => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)
            const purchaseDate = toIsoDateOrNull(form.purchaseDate)
            const payload = CreateAssetRequestSchema.parse({
                title: `${form.brand} ${form.model}`.trim(),
                type: 'VEHICLE',
                currency: form.currency,
                currentValue: toNumberOrNull(form.currentValue),
                currentValueAsOf: purchaseDate,
                vehicle: {
                    brand: form.brand,
                    model: form.model,
                    type: form.type,
                    year: toNumberOrNull(form.year),
                    purchasePrice: toNumberOrNull(form.currentValue),
                    purchaseDate,
                    plateNumber: form.plateNumber || null,
                    vin: null,
                    mileage: null,
                    condition: null
                }
            } satisfies CreateAssetRequest)

            const response = await createMutation.mutateAsync({ body: payload })

            if (!response.success) return

            modalManager.closeModal()
            toast.success(t('messages.successfully', { a: payload.title, b: t('messages.saved') }))
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<AssetData>
            modalId={MODAL_IDS.VEHICLE_DIALOG}
            open={modalManager.isOpen}
            title='Add vehicle'
            footer={{ show: true }}
            confirmButtonText='buttons.add.base'
            onClick={() => formRef.current?.requestSubmit()}
        >
            <form
                ref={formRef}
                className='flex flex-col space-y-6'
                onSubmit={event => {
                    event.preventDefault()
                    submitForm()
                }}
            >
                <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                        <FieldLabel label='Brand' mandatory />
                        <Input
                            variant='contained'
                            value={form.brand}
                            onChange={event => updateField('brand', event.target.value)}
                        />
                    </div>
                    <div className='space-y-2'>
                        <FieldLabel label='Model' mandatory />
                        <Input
                            variant='contained'
                            value={form.model}
                            onChange={event => updateField('model', event.target.value)}
                        />
                    </div>
                </div>
                <div className='space-y-2'>
                    <FieldLabel label={t('form.type.label')} mandatory />
                    <SelectInput
                        value={form.type}
                        options={vehicleOptions}
                        placeholder={t('form.type.placeholder')}
                        onChange={value => updateField('type', value)}
                    />
                </div>
                <div className='space-y-2'>
                    <FieldLabel label='Value' mandatory />
                    <Input
                        type='number'
                        min='0'
                        step='0.01'
                        variant='contained'
                        value={form.currentValue}
                        placeholder='0,00'
                        onChange={event => updateField('currentValue', event.target.value)}
                    />
                </div>
                <div className='grid grid-cols-3 gap-3'>
                    <div className='space-y-2'>
                        <FieldLabel label='Purchase date' />
                        <Input
                            type='date'
                            variant='contained'
                            value={form.purchaseDate}
                            onChange={event => updateField('purchaseDate', event.target.value)}
                        />
                    </div>
                    <div className='space-y-2'>
                        <FieldLabel label='Vehicle year' />
                        <Input
                            type='number'
                            variant='contained'
                            value={form.year}
                            onChange={event => updateField('year', event.target.value)}
                        />
                    </div>
                    <div className='space-y-2'>
                        <FieldLabel label='Plate' />
                        <Input
                            variant='contained'
                            value={form.plateNumber}
                            onChange={event => updateField('plateNumber', event.target.value)}
                        />
                    </div>
                </div>
                <div className='space-y-4 border-t border-hr pt-4'>
                    <div className='flex items-center space-x-2'>
                        <Switch
                            checked={form.autoDepreciation}
                            onCheckedChange={checked => updateField('autoDepreciation', checked)}
                        />
                        <div>
                            <p>Setup auto depreciation?</p>
                            <p className='text-muted-foreground'>
                                The system will automatically depreciate this vehicle.
                            </p>
                        </div>
                    </div>
                    {form.autoDepreciation && (
                        <div className='grid grid-cols-2 gap-3'>
                            <Input
                                type='number'
                                min='0'
                                step='0.01'
                                variant='contained'
                                value={form.depreciationPercentage}
                                placeholder='Percentage'
                                onChange={event => updateField('depreciationPercentage', event.target.value)}
                            />
                            <Input
                                variant='contained'
                                value={form.depreciationEvery}
                                placeholder='Every'
                                onChange={event => updateField('depreciationEvery', event.target.value)}
                            />
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    )
}
