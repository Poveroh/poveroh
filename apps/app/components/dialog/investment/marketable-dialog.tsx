import { MODAL_IDS } from '@/types/constant'
import { BaseMarketableDialog } from './base-marketable-asset-dialog'
import { useTranslations } from 'next-intl'

export function MarketableDialog() {
    const t = useTranslations()

    return (
        <BaseMarketableDialog
            modalId={MODAL_IDS.TICKET_SYMBOL}
            title={t('investments.assets.ticket-symbol.modal.newTitle')}
            assetType={['STOCK', 'ETF']}
            defaultSymbol=''
        />
    )
}
