import { AssetTransactionTypeEnum } from './contracts.js'
import { Item } from './item.js'

export type AssetConfig = {
    title: string
    subtitle: string
    modalId: string
    icons: string
}

export const AssetTypeCatalog: Item<AssetTransactionTypeEnum>[] = [
    { label: 'investments.assets.form.transactionType.buy', value: 'BUY' },
    { label: 'investments.assets.form.transactionType.sell', value: 'SELL' }
]
