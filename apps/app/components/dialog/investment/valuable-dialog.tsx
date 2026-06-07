'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { CollectibleAssetForm } from '@/components/form/collectible-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { CreateUpdateCollectibleAssetRequest, FormRef } from '@/types'
import type { AssetData, CreateCollectibleAssetRequest, UpdateCollectibleAssetRequest } from '@poveroh/types'

export function ValuableDialog() {
    const t = useTranslations()
    const { createCollectibleMutation, updateCollectibleMutation } = useAsset()
    const { handleError } = useError()

    const modalManager = useModal<AssetData>(MODAL_IDS.VALUABLE_DIALOG)
    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateCollectibleAssetRequest) => {
        const response = await createCollectibleMutation.mutateAsync({
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

    const onUpdate = async (payload: UpdateCollectibleAssetRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateCollectibleMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateCollectibleAssetRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateCollectibleAssetRequest)
            } else {
                await onCreate(payload as CreateCollectibleAssetRequest)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<AssetData>
            modalId={MODAL_IDS.VALUABLE_DIALOG}
            open={modalManager.isOpen}
            title={t('investments.assets.valuable.title')}
            footer={{ show: true }}
            confirmButtonText='buttons.add.base'
            onClick={() => formRef.current?.submit()}
        >
            <CollectibleAssetForm
                ref={formRef}
                initialData={modalManager.item ?? null}
                inEditingMode={modalManager.inEditingMode}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
