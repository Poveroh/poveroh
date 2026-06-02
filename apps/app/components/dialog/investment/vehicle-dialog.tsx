'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { VehicleAssetForm } from '@/components/form/vehicle-asset-form'
import { useAsset } from '@/hooks/use-asset'
import { useError } from '@/hooks/use-error'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { CreateUpdateVehicleAssetRequest, FormRef } from '@/types'
import type { AssetData, CreateVehicleAssetRequest, UpdateVehicleAssetRequest } from '@poveroh/types'

export function VehicleDialog() {
    const t = useTranslations()
    const { createVehicleMutation, updateVehicleMutation } = useAsset()
    const { handleError } = useError()

    const modalManager = useModal<AssetData>(MODAL_IDS.VEHICLE_DIALOG)
    const formRef = useRef<FormRef | null>(null)

    const buildTitle = (payload: CreateUpdateVehicleAssetRequest) =>
        `${payload.brand ?? ''} ${payload.model ?? ''}`.trim()

    const onCreate = async (payload: CreateVehicleAssetRequest, files: File[]) => {
        const response = await createVehicleMutation.mutateAsync({
            body: {
                data: payload,
                file: files
            }
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

        toast.success(t('messages.successfully', { a: buildTitle(payload), b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateVehicleAssetRequest, files: File[]) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateVehicleMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: {
                data: payload,
                file: files
            }
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: buildTitle(payload), b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateVehicleAssetRequest, files: File[]) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateVehicleAssetRequest, files)
            } else {
                await onCreate(payload as CreateVehicleAssetRequest, files)
            }
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
            title={t('investments.assets.vehicle.title')}
            footer={{ show: true }}
            confirmButtonText='buttons.add.base'
            onClick={() => formRef.current?.submit()}
            decoration={{
                dialogWidth: 'sm:w-[760px]',
                iconLogo: { name: '', mode: 'ICON' }
            }}
        >
            <VehicleAssetForm
                ref={formRef}
                initialData={modalManager.item ?? null}
                inEditingMode={modalManager.inEditingMode}
                dataCallback={handleFormSubmit}
            />
        </Modal>
    )
}
