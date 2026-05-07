'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { MarketableAssetForm } from '@/components/form/marketable-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import type { FormRef, MarketableAssetSubmitPayload } from '@/types'
import { CreateAssetTransactionRequestSchema } from '@poveroh/schemas'
import type { AssetData, AssetTypeEnum, MarketableAssetClassEnum } from '@poveroh/types'

type MarketableDialogProps = {
    modalId: string
    title: string
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTOCURRENCY'>
    assetClass: Extract<MarketableAssetClassEnum, 'EQUITY' | 'CRYPTO'>
    defaultSymbol: string
}

export function MarketableDialog({ modalId, title, assetType, assetClass, defaultSymbol }: MarketableDialogProps) {
    const t = useTranslations()
    const { createMutation, createTransactionMutation } = useAsset()
    const modalManager = useModal<AssetData>(modalId)
    const { handleError } = useError()
    const formRef = useRef<FormRef | null>(null)

    // A marketable asset needs the asset row before the initial position transaction can be stored.
    const handleFormSubmit = async (payload: MarketableAssetSubmitPayload) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            const assetResponse = await createMutation.mutateAsync({ body: payload.asset })

            if (!assetResponse.success || !assetResponse.data?.id) return

            const transactionPayload = CreateAssetTransactionRequestSchema.parse({
                ...payload.transaction,
                assetId: assetResponse.data.id
            })

            await createTransactionMutation.mutateAsync({ body: transactionPayload })

            if (modalManager.keepAdding.checked) {
                formRef.current?.reset()
            } else {
                modalManager.closeModal()
            }

            toast.success(t('messages.successfully', { a: payload.asset.title, b: t('messages.saved') }))
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
                assetClass={assetClass}
                defaultSymbol={defaultSymbol}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
