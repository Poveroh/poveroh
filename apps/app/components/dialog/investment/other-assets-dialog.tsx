'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { OtherAssetForm } from '@/components/form/other-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { CreateUpdateOtherAssetRequest, FormRef } from '@/types'
import type { AssetData, CreateOtherAssetRequest, UpdateOtherAssetRequest } from '@poveroh/types'

export function OtherAssetsDialog() {
    const t = useTranslations()
    const { createOtherMutation, updateOtherMutation } = useAsset()
    const { handleError } = useError()

    const modalManager = useModal<AssetData>(MODAL_IDS.OTHER_ASSETS_DIALOG)
    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateOtherAssetRequest) => {
        const response = await createOtherMutation.mutateAsync({
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

    const onUpdate = async (payload: UpdateOtherAssetRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateOtherMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateOtherAssetRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateOtherAssetRequest)
            } else {
                await onCreate(payload as CreateOtherAssetRequest)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<AssetData>
            modalId={MODAL_IDS.OTHER_ASSETS_DIALOG}
            open={modalManager.isOpen}
            title={t('investments.assets.other.title')}
            footer={{ show: true }}
            confirmButtonText='buttons.add.base'
            onClick={() => formRef.current?.submit()}
        >
            <OtherAssetForm
                ref={formRef}
                initialData={modalManager.item ?? null}
                inEditingMode={modalManager.inEditingMode}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
