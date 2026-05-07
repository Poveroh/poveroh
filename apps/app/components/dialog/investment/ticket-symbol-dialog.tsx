import { MODAL_IDS } from '@/types/constant'
import { MarketableDialog } from './marketable-asset-dialog'

export function TicketSymbolDialog() {
    return (
        <MarketableDialog
            modalId={MODAL_IDS.TICKET_SYMBOL}
            title='Add ticket'
            assetType='STOCK'
            assetClass='EQUITY'
            defaultSymbol='APPL'
        />
    )
}
