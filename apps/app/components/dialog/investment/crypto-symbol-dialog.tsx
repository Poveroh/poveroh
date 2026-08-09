import { MODAL_IDS } from '@/types/constant'
import { BaseMarketableDialog } from './base-marketable-asset-dialog'
import { useTranslations } from 'next-intl'

export function CryptoDialog() {
    const t = useTranslations()

    return (
        <BaseMarketableDialog
            modalId={MODAL_IDS.CRYPTO_DIALOG}
            title={t('investments.assets.crypto.modal.newTitle')}
            assetType={['CRYPTO']}
            defaultSymbol=''
        />
    )
}
