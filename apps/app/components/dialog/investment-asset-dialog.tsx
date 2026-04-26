import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useModal } from '@/hooks/use-modal'
import { SubscriptionData } from '@poveroh/types'
import { MODAL_IDS } from '@/types/constant'
import { AssetSelector } from '../form/asset-selector'

export function InvestmentAssetDialog() {
    const t = useTranslations()

    const modalManager = useModal<SubscriptionData>(MODAL_IDS.INVESTMENT_ASSET)

    return (
        <Modal<SubscriptionData>
            modalId={MODAL_IDS.INVESTMENT_ASSET}
            open={modalManager.isOpen}
            title={
                modalManager.inEditingMode && modalManager.item
                    ? modalManager.item.title
                    : t('categories.modal.newTitle')
            }
            footer={{
                show: false
            }}
            onClick={() => {}}
            onOpenChange={x => {
                console.log(x)
            }}
        >
            <AssetSelector dataCallback={() => {}} />
        </Modal>
    )
}
