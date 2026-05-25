import { MODAL_IDS } from '@/types/constant'
import { BaseMarketableDialog } from './base-marketable-asset-dialog'

export function CryptoDialog() {
    return (
        <BaseMarketableDialog
            modalId={MODAL_IDS.CRYPTO_DIALOG}
            title='Add crypto'
            assetType='CRYPTOCURRENCY'
            defaultSymbol='BTC'
        />
    )
}
