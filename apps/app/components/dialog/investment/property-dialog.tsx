'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { RealEstateAssetForm } from '@/components/form/real-estate-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { CreateUpdateRealEstateAssetRequest, FormRef } from '@/types'
import type { AssetData, CreateRealEstateAssetRequest, UpdateRealEstateAssetRequest } from '@poveroh/types'

export function PropertyDialog() {
    const t = useTranslations()
    const { createRealEstateMutation, updateRealEstateMutation } = useAsset()
    const { handleError } = useError()

    const modalManager = useModal<AssetData>(MODAL_IDS.PROPERTY_DIALOG)
    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateRealEstateAssetRequest) => {
        const response = await createRealEstateMutation.mutateAsync({
            body: payload
        })

        if (!response?.success) {
            modalManager.setLoading(false)
            return
        }

        if (modalManager.keepAdding.checked) {
            formRef.current?.reset()
        } else {
            modalManager.closeModal()
        }

        toast.success(t('messages.successfully', { a: payload.title, b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateRealEstateAssetRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateRealEstateMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateRealEstateAssetRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateRealEstateAssetRequest)
            } else {
                await onCreate(payload as CreateRealEstateAssetRequest)
            }
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
            title={t('investments.assets.property.title')}
            footer={{ show: true }}
            confirmButtonText='buttons.add.base'
            onClick={() => formRef.current?.submit()}
        >
            <RealEstateAssetForm
                ref={formRef}
                initialData={modalManager.item ?? null}
                inEditingMode={modalManager.inEditingMode}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
