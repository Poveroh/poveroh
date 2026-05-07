import { MODAL_IDS } from '@/types/constant'
import { MarketableDialog } from './marketable-asset-dialog'

export function CryptoDialog() {
    return (
        <MarketableDialog
            modalId={MODAL_IDS.CRYPTO_DIALOG}
            title='Add crypto'
            assetType='CRYPTOCURRENCY'
            assetClass='CRYPTO'
            defaultSymbol='BTC'
        />
    )
}
