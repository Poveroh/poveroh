import {
    AssetTransactionTypeEnum,
    AssetTypeEnum,
    CyclePeriodEnum,
    RealEstateTypeEnum,
    VehicleTypeEnum
} from './contracts.js'
import { Item } from './item.js'

export type AssetConfig = {
    title: string
    subtitle: string
    modalId: string
    icons: string
}

/**
 * The table layout used to render a group of assets: quoted holdings (quantity/price/weight) or physical goods (year/buy date).
 */
export type AssetGroupLayout = 'marketable' | 'physical'

/**
 * A summary group on the investments page: an asset type, its translated heading and the table layout it should use.
 */
export type AssetGroup = {
    type: AssetTypeEnum
    label: string
    layout: AssetGroupLayout
}

export const ASSET_GROUP_CATALOG: AssetGroup[] = [
    { type: 'STOCK', label: 'investments.assets.groups.stock', layout: 'marketable' },
    { type: 'BOND', label: 'investments.assets.groups.bond', layout: 'marketable' },
    { type: 'ETF', label: 'investments.assets.groups.etf', layout: 'marketable' },
    { type: 'CRYPTOCURRENCY', label: 'investments.assets.groups.crypto', layout: 'marketable' },
    { type: 'REAL_ESTATE', label: 'investments.assets.groups.property', layout: 'physical' },
    { type: 'VEHICLE', label: 'investments.assets.groups.vehicle', layout: 'physical' },
    { type: 'COLLECTIBLE', label: 'investments.assets.groups.valuables', layout: 'physical' }
]

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
