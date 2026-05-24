'use client'

import { useTranslations } from 'next-intl'

import Modal from '@/components/modal/modal'
import { AssetSelector } from '@/components/form/asset-selector'
import { useModal } from '@/hooks/use-modal'
import { MODAL_IDS } from '@/types/constant'
import type { AssetData } from '@poveroh/types'

export function InvestmentAssetDialog() {
    const t = useTranslations()
    const modalManager = useModal<AssetData>(MODAL_IDS.INVESTMENT_ASSET)
    const ticketModal = useModal<AssetData>(MODAL_IDS.TICKET_SYMBOL)
    const cryptoModal = useModal<AssetData>(MODAL_IDS.CRYPTO_DIALOG)
    const propertyModal = useModal<AssetData>(MODAL_IDS.PROPERTY_DIALOG)
    const vehicleModal = useModal<AssetData>(MODAL_IDS.VEHICLE_DIALOG)
    const valuableModal = useModal<AssetData>(MODAL_IDS.VALUABLE_DIALOG)
    const otherAssetModal = useModal<AssetData>(MODAL_IDS.OTHER_ASSETS_DIALOG)

    const modalById = {
        [MODAL_IDS.TICKET_SYMBOL]: ticketModal,
        [MODAL_IDS.CRYPTO_DIALOG]: cryptoModal,
        [MODAL_IDS.PROPERTY_DIALOG]: propertyModal,
        [MODAL_IDS.VEHICLE_DIALOG]: vehicleModal,
        [MODAL_IDS.VALUABLE_DIALOG]: valuableModal,
        [MODAL_IDS.OTHER_ASSETS_DIALOG]: otherAssetModal
    }

    return (
        <Modal<AssetData>
            modalId={MODAL_IDS.INVESTMENT_ASSET}
            open={modalManager.isOpen}
            title={t('investments.assets.modal.newTitle')}
            description={t('investments.assets.modal.newSubtitle')}
            footer={{
                show: false
            }}
            onClick={() => {}}
            decoration={{
                dialogWidth: 'sm:w-[920px]',
                contentHeight: 'max-h-[70vh]',
                iconLogo: {
                    name: '',
                    mode: 'ICON'
                }
            }}
        >
            <AssetSelector
                dataCallback={modalId => {
                    modalManager.closeModal()
                    modalById[modalId]?.openModal('create')
                }}
            />
        </Modal>
    )
}
