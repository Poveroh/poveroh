import { Label } from '@poveroh/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@poveroh/ui/components/select'

import type {
    AssetTransactionTypeEnum,
    AssetTypeEnum,
    CurrencyEnum,
    RealEstateTypeEnum,
    VehicleTypeEnum
} from '@poveroh/types'

export type Option<T extends string> = {
    label: string
    value: T
}

export type MarketableFormState = {
    transactionType: Extract<AssetTransactionTypeEnum, 'BUY' | 'SELL'>
    symbol: string
    title: string
    date: string
    quantity: string
    unitPrice: string
    fees: string
    currency: CurrencyEnum
}

export type PropertyFormState = {
    title: string
    type: RealEstateTypeEnum
    currentValue: string
    purchaseDate: string
    address: string
    currency: CurrencyEnum
}

export type VehicleFormState = {
    brand: string
    model: string
    type: VehicleTypeEnum
    currentValue: string
    purchaseDate: string
    year: string
    plateNumber: string
    autoDepreciation: boolean
    depreciationPercentage: string
    depreciationEvery: string
    currency: CurrencyEnum
}

export type ValuableFormState = {
    title: string
    type: AssetTypeEnum
    currentValue: string
    purchaseDate: string
    description: string
    currency: CurrencyEnum
}

export const currencyOptions: Option<CurrencyEnum>[] = [
    { label: 'EUR', value: 'EUR' },
    { label: 'USD', value: 'USD' },
    { label: 'GBP', value: 'GBP' }
]

export const realEstateOptions: Option<RealEstateTypeEnum>[] = [
    { label: 'Main house', value: 'PRIMARY_HOUSE' },
    { label: 'Second house', value: 'SECONDARY_HOUSE' },
    { label: 'Rental property', value: 'RENTAL_PROPERTY' }
]

export const vehicleOptions: Option<VehicleTypeEnum>[] = [
    { label: 'Car', value: 'CAR' },
    { label: 'Motorcycle', value: 'MOTORCYCLE' },
    { label: 'Boat', value: 'BOAT' },
    { label: 'Bike', value: 'BIKE' },
    { label: 'Other', value: 'OTHER' }
]

export const valuableOptions: Option<AssetTypeEnum>[] = [
    { label: 'Collectible', value: 'COLLECTIBLE' },
    { label: 'Private equity', value: 'PRIVATE_EQUITY' },
    { label: 'Private debt', value: 'PRIVATE_DEBT' },
    { label: 'P2P lending', value: 'P2P_LENDING' },
    { label: 'Other', value: 'OTHER' }
]

export const toNumberOrNull = (value: string) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

export const toIsoDateOrNull = (value: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null)

export function FieldLabel({ label, mandatory = false }: { label: string; mandatory?: boolean }) {
    return (
        <Label className='text-xs'>
            {label}
            {mandatory && <span className='text-danger ml-1'>*</span>}
        </Label>
    )
}

export function SelectInput<T extends string>({
    value,
    options,
    placeholder,
    onChange
}: {
    value: T
    options: Option<T>[]
    placeholder: string
    onChange: (value: T) => void
}) {
    return (
        <Select value={value} onValueChange={value => onChange(value as T)}>
            <SelectTrigger variant='contained'>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className='flex items-center justify-between border-b border-hr py-3 last:border-b-0'>
            <p className={strong ? 'font-semibold' : 'text-muted-foreground'}>{label}</p>
            <p className={strong ? 'font-semibold' : undefined}>{value}</p>
        </div>
    )
}
