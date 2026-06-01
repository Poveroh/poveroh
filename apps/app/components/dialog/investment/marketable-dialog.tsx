import { MODAL_IDS } from '@/types/constant'
import { BaseMarketableDialog } from './base-marketable-asset-dialog'

export function MarketableDialog() {
    return (
        <BaseMarketableDialog
            modalId={MODAL_IDS.TICKET_SYMBOL}
            title='Add marketable asset'
            assetType='STOCK'
            defaultSymbol=''
        />
    )
}
