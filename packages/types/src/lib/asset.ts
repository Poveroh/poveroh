import { AssetTransactionTypeEnum, RealEstateTypeEnum } from './contracts.js'
import { Item } from './item.js'

export type AssetConfig = {
    title: string
    subtitle: string
    modalId: string
    icons: string
}

export const ASSET_TYPE_CATALOG: Item<AssetTransactionTypeEnum>[] = [
    { label: 'investments.assets.form.transactionType.buy', value: 'BUY' },
    { label: 'investments.assets.form.transactionType.sell', value: 'SELL' }
]

export const REAL_ESTATE_TYPE_CATALOG: Item<RealEstateTypeEnum>[] = [
    { label: 'investments.assets.form.realEstateType.primaryHouse', value: 'PRIMARY_HOUSE' },
    { label: 'investments.assets.form.realEstateType.secondaryHouse', value: 'SECONDARY_HOUSE' },
    { label: 'investments.assets.form.realEstateType.rentalProperty', value: 'RENTAL_PROPERTY' }
]
