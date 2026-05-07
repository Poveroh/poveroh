'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@poveroh/ui/components/input'
import { toast } from '@poveroh/ui/components/sonner'

import {
    FieldLabel,
    SelectInput,
    toIsoDateOrNull,
    toNumberOrNull,
    valuableOptions
} from '@/components/dialog/investment/investment-dialog-fields'
import type { ValuableFormState } from '@/components/dialog/investment/investment-dialog-fields'
import Modal from '@/components/modal/modal'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import { CreateAssetRequestSchema } from '@poveroh/schemas'
import type { AssetData, AssetTypeEnum } from '@poveroh/types'

function ValuableDialog({
    modalId,
    title,
    defaultType
}: {
    modalId: string
    title: string
    defaultType: AssetTypeEnum
}) {
    const t = useTranslations()
    const modalManager = useModal<AssetData>(modalId)
    const { createMutation } = useAsset()
    const { handleError } = useError()
    const formRef = useRef<HTMLFormElement | null>(null)
    const [form, setForm] = useState<ValuableFormState>({
        title: '',
        type: defaultType,
        currentValue: '',
        purchaseDate: '',
        description: '',
        currency: 'EUR'
    })

    const updateField = <K extends keyof ValuableFormState>(key: K, value: ValuableFormState[K]) => {
        setForm(current => ({ ...current, [key]: value }))
    }

    const submitForm = async () => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)
            const purchaseDate = toIsoDateOrNull(form.purchaseDate)
            const basePayload = {
                title: form.title,
                type: form.type,
                currency: form.currency,
                currentValue: toNumberOrNull(form.currentValue),
                currentValueAsOf: purchaseDate
            }

            const payload = CreateAssetRequestSchema.parse(
                form.type === 'COLLECTIBLE'
                    ? {
                          ...basePayload,
                          collectible: {
                              acquisitionCost: toNumberOrNull(form.currentValue),
                              acquisitionDate: purchaseDate,
                              appraisalValue: toNumberOrNull(form.currentValue),
                              appraisalDate: purchaseDate
                          }
                      }
                    : form.type === 'OTHER'
                      ? basePayload
                      : {
                            ...basePayload,
                            privateDeal: {
                                committedAmount: toNumberOrNull(form.currentValue),
                                calledAmount: null,
                                latestNav: toNumberOrNull(form.currentValue),
                                navDate: purchaseDate
                            }
                        }
            )

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
            modalId={modalId}
            open={modalManager.isOpen}
            title={title}
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
                    <FieldLabel label={t('form.type.label')} mandatory />
                    <SelectInput
                        value={form.type}
                        options={valuableOptions}
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
                        <FieldLabel label={t('form.description.label')} />
                        <Input
                            variant='contained'
                            value={form.description}
                            onChange={event => updateField('description', event.target.value)}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}

export function ValuableAssetDialog() {
    return <ValuableDialog modalId={MODAL_IDS.VALUABLE_DIALOG} title='Add valuables' defaultType='COLLECTIBLE' />
}

export function OtherAssetDialog() {
    return <ValuableDialog modalId={MODAL_IDS.OTHER_ASSETS_DIALOG} title='Add other asset' defaultType='OTHER' />
}
