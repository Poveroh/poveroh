'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@poveroh/ui/components/input'
import { toast } from '@poveroh/ui/components/sonner'

import {
    FieldLabel,
    realEstateOptions,
    SelectInput,
    toIsoDateOrNull,
    toNumberOrNull
} from '@/components/dialog/investment/investment-dialog-fields'
import type { PropertyFormState } from '@/components/dialog/investment/investment-dialog-fields'
import Modal from '@/components/modal/modal'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import { CreateAssetRequestSchema } from '@poveroh/schemas'
import type { AssetData, CreateAssetRequest } from '@poveroh/types'

export function PropertyAssetDialog() {
    const t = useTranslations()
    const modalManager = useModal<AssetData>(MODAL_IDS.PROPERTY_DIALOG)
    const { createMutation } = useAsset()
    const { handleError } = useError()
    const formRef = useRef<HTMLFormElement | null>(null)
    const [form, setForm] = useState<PropertyFormState>({
        title: '',
        type: 'PRIMARY_HOUSE',
        currentValue: '',
        purchaseDate: '',
        address: '',
        currency: 'EUR'
    })

    const updateField = <K extends keyof PropertyFormState>(key: K, value: PropertyFormState[K]) => {
        setForm(current => ({ ...current, [key]: value }))
    }

    const submitForm = async () => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)
            const purchaseDate = toIsoDateOrNull(form.purchaseDate)
            const payload = CreateAssetRequestSchema.parse({
                title: form.title,
                type: 'REAL_ESTATE',
                currency: form.currency,
                currentValue: toNumberOrNull(form.currentValue),
                currentValueAsOf: purchaseDate,
                realEstate: {
                    address: form.address || null,
                    type: form.type,
                    purchasePrice: toNumberOrNull(form.currentValue),
                    purchaseDate
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
            modalId={MODAL_IDS.PROPERTY_DIALOG}
            open={modalManager.isOpen}
            title='Add property'
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
                <div className='space-y-2'>
                    <FieldLabel label={t('form.name.label')} mandatory />
                    <Input
                        variant='contained'
                        value={form.title}
                        onChange={event => updateField('title', event.target.value)}
                    />
                </div>
                <div className='space-y-2'>
                    <FieldLabel label='Property type' mandatory />
                    <SelectInput
                        value={form.type}
                        options={realEstateOptions}
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
                <div className='grid grid-cols-2 gap-3'>
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
                        <FieldLabel label='Address' />
                        <Input
                            variant='contained'
                            value={form.address}
                            onChange={event => updateField('address', event.target.value)}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
