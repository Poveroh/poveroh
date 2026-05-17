'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { MarketableAssetForm } from '@/components/form/marketable-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import type { FormRef } from '@/types'
import type {
    AssetData,
    AssetTypeEnum,
    CreateMarketableAssetRequest,
    UpdateMarketableAssetRequest
} from '@poveroh/types'

type MarketableDialogProps = {
    modalId: string
    title: string
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTOCURRENCY'>
    defaultSymbol: string
}

export function MarketableDialog({ modalId, title, assetType, defaultSymbol }: MarketableDialogProps) {
    const t = useTranslations()
    const { createMarketableMutation, updateMarketableMutation } = useAsset()
    const { handleError } = useError()

    const modalManager = useModal<AssetData>(modalId)
    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateMarketableAssetRequest) => {
        const response = await createMarketableMutation.mutateAsync({
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

        toast.success(t('messages.successfully', { a: payload.symbol ?? '', b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateMarketableAssetRequest) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateMarketableMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: payload
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.symbol ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateMarketableAssetRequest | UpdateMarketableAssetRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateMarketableAssetRequest)
            } else {
                await onCreate(payload as CreateMarketableAssetRequest)
            }
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
            onClick={() => formRef.current?.submit()}
        >
            <MarketableAssetForm
                ref={formRef}
                initialData={modalManager.item ?? null}
                inEditingMode={modalManager.inEditingMode}
                assetType={assetType}
                defaultSymbol={defaultSymbol}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
