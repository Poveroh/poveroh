import { AssetTransactionTypeEnum, CyclePeriodEnum, RealEstateTypeEnum, VehicleTypeEnum } from './contracts.js'
import { Item } from './item.js'

export type AssetConfig = {
    title: string
    subtitle: string
    modalId: string
    icons: string
}

/**
 * A selectable depreciation cadence that maps a single "Every" option to the underlying cyclePeriod + cycleNumber pair.
 */
export type DepreciationCycleOption = Item<string> & {
    cyclePeriod: CyclePeriodEnum
    cycleNumber: number
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

export const VEHICLE_TYPE_CATALOG: Item<VehicleTypeEnum>[] = [
    { label: 'investments.assets.form.vehicleType.car', value: 'CAR' },
    { label: 'investments.assets.form.vehicleType.boat', value: 'BOAT' },
    { label: 'investments.assets.form.vehicleType.motorcycle', value: 'MOTORCYCLE' },
    { label: 'investments.assets.form.vehicleType.snowmobile', value: 'SNOWMOBILE' },
    { label: 'investments.assets.form.vehicleType.bike', value: 'BIKE' },
    { label: 'investments.assets.form.vehicleType.other', value: 'OTHER' }
]

export const DEPRECIATION_CYCLE_CATALOG: DepreciationCycleOption[] = [
    {
        label: 'investments.assets.form.depreciation.cycle.month',
        value: 'MONTH_1',
        cyclePeriod: 'MONTH',
        cycleNumber: 1
    },
    {
        label: 'investments.assets.form.depreciation.cycle.sixMonths',
        value: 'MONTH_6',
        cyclePeriod: 'MONTH',
        cycleNumber: 6
    },
    { label: 'investments.assets.form.depreciation.cycle.year', value: 'YEAR_1', cyclePeriod: 'YEAR', cycleNumber: 1 },
    {
        label: 'investments.assets.form.depreciation.cycle.twoYears',
        value: 'YEAR_2',
        cyclePeriod: 'YEAR',
        cycleNumber: 2
    },
    {
        label: 'investments.assets.form.depreciation.cycle.fiveYears',
        value: 'YEAR_5',
        cyclePeriod: 'YEAR',
        cycleNumber: 5
    }
]
