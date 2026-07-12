import { z } from 'zod'
import type {
    AssetData,
    AssetTransactionTypeEnum,
    AssetTypeEnum,
    CreateCollectibleAssetRequest,
    CreateImportRequest,
    CreateMarketableAssetRequest,
    CreateOtherAssetRequest,
    CreateRealEstateAssetRequest,
    CreateFinancialAccountBalanceRequest,
    CreateUpdateTransactionRequest,
    CreateVehicleAssetRequest,
    CurrencyEnum,
    ImportData,
    FinancialAccountBalanceData,
    InputVariantStyle,
    RealEstateTypeEnum,
    UpdateCollectibleAssetRequest,
    UpdateMarketableAssetRequest,
    UpdateOtherAssetRequest,
    UpdateRealEstateAssetRequest,
    UpdateVehicleAssetRequest,
    VehicleTypeEnum
} from '@poveroh/types'
import { LucideIcon } from 'lucide-react'
import { InputHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'
import type { TransactionActionEnum, TransactionData } from '@poveroh/types'

type AmountSchemaErrors = {
    required_error: string
    invalid_type_error: string
}

export type BaseTransactionFormConfig<T extends FieldValues> = {
    type: TransactionActionEnum
    defaultValues: T
    schema: z.ZodType
    transformInitialData?: (data: TransactionData) => T
}

export const amountSchema = (errors: AmountSchemaErrors) => {
    return z
        .number({
            message: errors.invalid_type_error
        })
        .positive()
}

export type FormProps<T, U> = {
    initialData: T | null
    inEditingMode: boolean
    dataCallback: (paylod: U, files: File[]) => Promise<void>
}

export type FormRef = {
    submit: () => void
    reset: () => void
}

// ------------------------------------------------------------------------------

export type TransactionFormProps = FormProps<TransactionData, CreateUpdateTransactionRequest> & {
    inputStyle?: InputVariantStyle
    defaultAccountId?: string
}

export type ImportFormProps = FormProps<ImportData, CreateImportRequest>

export type AccountSnapshotFormProps = FormProps<FinancialAccountBalanceData, CreateFinancialAccountBalanceRequest> & {
    accountId: string
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    startIcon?: LucideIcon
    variant?: InputVariantStyle
    endIcon?: LucideIcon
}

export type MarketableAssetFormValues = {
    transactionType: Extract<AssetTransactionTypeEnum, 'BUY' | 'SELL'>
    symbol: string
    date: string
    quantity: number
    unitPrice: number
    fees: number
    currency: CurrencyEnum
}

export type CreateUpdateMarketableAssetRequest = CreateMarketableAssetRequest | UpdateMarketableAssetRequest

export type MarketableAssetFormProps = FormProps<AssetData, CreateUpdateMarketableAssetRequest> & {
    assetType: Extract<AssetTypeEnum, 'STOCK' | 'CRYPTO'>
    defaultSymbol: string
}

export type RealEstateAssetFormValues = {
    title: string
    type: RealEstateTypeEnum
    value: number
    purchaseDate?: string
    address?: string
}

export type CreateUpdateRealEstateAssetRequest = CreateRealEstateAssetRequest | UpdateRealEstateAssetRequest

export type RealEstateAssetFormProps = FormProps<AssetData, CreateUpdateRealEstateAssetRequest>

export type CollectibleAssetFormValues = {
    title: string
    value: number
    acquisitionDate?: string
    appraisalValue?: number
    appraisalDate?: string
}

export type CreateUpdateCollectibleAssetRequest = CreateCollectibleAssetRequest | UpdateCollectibleAssetRequest

export type CollectibleAssetFormProps = FormProps<AssetData, CreateUpdateCollectibleAssetRequest>

export type OtherAssetFormValues = {
    title: string
    value: number
    purchaseDate?: string
    description?: string
}

export type CreateUpdateOtherAssetRequest = CreateOtherAssetRequest | UpdateOtherAssetRequest

export type OtherAssetFormProps = FormProps<AssetData, CreateUpdateOtherAssetRequest>

export type VehicleAssetFormValues = {
    brand: string
    model: string
    type: VehicleTypeEnum
    value: number
    purchaseDate?: string
    year?: number
    plateNumber?: string
    logoIcon?: string
    enableDepreciation: boolean
    depreciationCycle?: string
    depreciationPercentage?: number
}

export type CreateUpdateVehicleAssetRequest = CreateVehicleAssetRequest | UpdateVehicleAssetRequest

export type VehicleAssetFormProps = FormProps<AssetData, CreateUpdateVehicleAssetRequest>
