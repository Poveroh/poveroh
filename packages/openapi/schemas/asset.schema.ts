import { z } from '../zod'
import {
    AssetConditionEnum,
    AssetTransactionTypeEnum,
    AssetTypeEnum,
    CurrencyEnum,
    InsurancePolicyTypeEnum,
    MarketableAssetClassEnum,
    RealEstateTypeEnum,
    VehicleTypeEnum
} from './enum.schema'
import { DateFilterSchema, ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Marketable asset schema representing equity-like or quoted instruments
 */
export const MarketableAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        symbol: z.string().nullable(),
        isin: z.string().nullable(),
        exchange: z.string().nullable(),
        assetClass: MarketableAssetClassEnum.nullable(),
        sector: z.string().nullable(),
        region: z.string().nullable(),
        lastPriceSync: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('MarketableAsset')

/**
 * Real estate asset schema representing property-specific details
 */
export const RealEstateAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        address: z.string().nullable(),
        type: RealEstateTypeEnum,
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('RealEstateAsset')

/**
 * Collectible asset schema representing valuables and collectibles
 */
export const CollectibleAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        acquisitionCost: z.number().nullable(),
        acquisitionDate: z.string().datetime().nullable(),
        appraisalValue: z.number().nullable(),
        appraisalDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('CollectibleAsset')

/**
 * Private deal asset schema representing illiquid private market positions
 */
export const PrivateDealAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        committedAmount: z.number().nullable(),
        calledAmount: z.number().nullable(),
        latestNav: z.number().nullable(),
        navDate: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('PrivateDealAsset')

/**
 * Vehicle asset schema representing vehicles tracked as assets
 */
export const VehicleAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        brand: z.string(),
        model: z.string(),
        type: VehicleTypeEnum,
        year: z.number().int().nullable(),
        purchasePrice: z.number().nullable(),
        purchaseDate: z.string().datetime().nullable(),
        plateNumber: z.string().nullable(),
        vin: z.string().nullable(),
        mileage: z.number().int().nullable(),
        condition: AssetConditionEnum.nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('VehicleAsset')

/**
 * Insurance asset schema representing insurance products with value
 */
export const InsuranceAssetSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        insurer: z.string().nullable(),
        policyType: InsurancePolicyTypeEnum.nullable(),
        policyNumber: z.string().nullable(),
        startDate: z.string().datetime().nullable(),
        endDate: z.string().datetime().nullable(),
        beneficiary: z.string().nullable(),
        premiumPaid: z.number().nullable(),
        premiumFrequency: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).nullable(),
        surrenderValue: z.number().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('InsuranceAsset')

/**
 * Asset position summary schema representing derived portfolio metrics for a single asset
 */
export const AssetPositionSummarySchema = z
    .object({
        quantity: z.number().nullable(),
        investedAmount: z.number().nullable(),
        proceedsAmount: z.number().nullable(),
        netContribution: z.number().nullable(),
        averageCost: z.number().nullable(),
        realizedCashFlow: z.number().nullable(),
        lastTransactionAt: z.string().datetime().nullable()
    })
    .openapi('AssetPositionSummary')

/**
 * Asset schema representing a user's investment or non-cash asset
 */
export const AssetSchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string().nonempty(),
        type: AssetTypeEnum,
        currency: CurrencyEnum,
        currentValue: z.number().nullable(),
        currentValueAsOf: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable(),
        marketable: MarketableAssetSchema.optional(),
        realEstate: RealEstateAssetSchema.optional(),
        collectible: CollectibleAssetSchema.optional(),
        privateDeal: PrivateDealAssetSchema.optional(),
        vehicle: VehicleAssetSchema.optional(),
        insurance: InsuranceAssetSchema.optional(),
        position: AssetPositionSummarySchema.optional()
    })
    .openapi('Asset')

/**
 * Response schema for getting asset data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while AssetSchema is the completed one
 * similar to Schema in DB
 */
export const AssetDataSchema = AssetSchema.omit({
    userId: true,
    deletedAt: true
}).openapi('AssetData')

/**
 * Asset by type summary schema representing portfolio aggregation grouped by asset type
 */
export const AssetByTypeSummarySchema = z
    .object({
        type: AssetTypeEnum,
        count: z.number().int().nonnegative(),
        totalCurrentValue: z.number()
    })
    .openapi('AssetByTypeSummary')

/**
 * Portfolio summary schema representing high-level aggregated investment metrics
 */
export const PortfolioSummarySchema = z
    .object({
        totalAssets: z.number().int().nonnegative(),
        totalCurrentValue: z.number(),
        totalWithLiveMarketData: z.number(),
        byType: z.array(AssetByTypeSummarySchema)
    })
    .openapi('PortfolioSummary')

/**
 * Response schema for getting a list of assets
 */
export const GetAssetListResponseSchema = SuccessResponseSchema(AssetDataSchema.array()).openapi('GetAssetListResponse')

/**
 * Response schema for getting a single asset by ID
 */
export const GetAssetResponseSchema = SuccessResponseSchema(AssetDataSchema).openapi('GetAssetResponse')

/**
 * Response schema for getting the aggregated portfolio summary
 */
export const GetPortfolioSummaryResponseSchema =
    SuccessResponseSchema(PortfolioSummarySchema).openapi('GetPortfolioSummaryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for marketable asset details
 */
export const CreateMarketableAssetDetailsSchema = MarketableAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateMarketableAssetDetails')

/**
 * Request schema for real estate asset details
 */
export const CreateRealEstateAssetDetailsSchema = RealEstateAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateRealEstateAssetDetails')

/**
 * Request schema for collectible asset details
 */
export const CreateCollectibleAssetDetailsSchema = CollectibleAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateCollectibleAssetDetails')

/**
 * Request schema for private deal asset details
 */
export const CreatePrivateDealAssetDetailsSchema = PrivateDealAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreatePrivateDealAssetDetails')

/**
 * Request schema for vehicle asset details
 */
export const CreateVehicleAssetDetailsSchema = VehicleAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateVehicleAssetDetails')

/**
 * Request schema for insurance asset details
 */
export const CreateInsuranceAssetDetailsSchema = InsuranceAssetSchema.omit({
    id: true,
    assetId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateInsuranceAssetDetails')

/**
 * Asset form schema representing the data structure for asset creation and editing forms
 */
export const AssetFormSchema = z
    .object({
        title: z.string().nonempty(),
        type: AssetTypeEnum,
        currency: CurrencyEnum.default('EUR'),
        currentValue: z.number().nullable().optional(),
        currentValueAsOf: z.string().datetime().nullable().optional(),
        marketable: CreateMarketableAssetDetailsSchema.optional(),
        realEstate: CreateRealEstateAssetDetailsSchema.optional(),
        collectible: CreateCollectibleAssetDetailsSchema.optional(),
        privateDeal: CreatePrivateDealAssetDetailsSchema.optional(),
        vehicle: CreateVehicleAssetDetailsSchema.optional(),
        insurance: CreateInsuranceAssetDetailsSchema.optional()
    })
    .openapi('AssetForm')

/**
 * Cross-field rules applied on top of AssetFormSchema:
 * - Asset types with a dedicated subtype require the matching subtype payload
 */
const refineAssetRules = <T extends z.ZodTypeAny>(schema: T) =>
    schema.superRefine((data: any, ctx) => {
        if (!data?.type) return

        const subtypeByType: Record<string, keyof typeof data | null> = {
            STOCK: 'marketable',
            BOND: 'marketable',
            ETF: 'marketable',
            MUTUAL_FUND: 'marketable',
            CRYPTOCURRENCY: 'marketable',
            REAL_ESTATE: 'realEstate',
            COLLECTIBLE: 'collectible',
            VEHICLE: 'vehicle',
            PRIVATE_EQUITY: 'privateDeal',
            VENTURE_CAPITAL: 'privateDeal',
            PRIVATE_DEBT: 'privateDeal',
            P2P_LENDING: 'privateDeal',
            INSURANCE_POLICY: 'insurance',
            OTHER: null
        }

        const expectedSubtype = subtypeByType[data.type]
        if (!expectedSubtype) return

        if (!data[expectedSubtype]) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [expectedSubtype],
                message: `Subtype data "${String(expectedSubtype)}" is required for asset type ${data.type}`
            })
        }
    })

/**
 * Request schema for creating a new asset
 */
export const CreateAssetRequestSchema = refineAssetRules(AssetFormSchema).openapi('CreateAssetRequest')

/**
 * Request schema for updating an existing asset
 */
export const UpdateAssetRequestSchema = refineAssetRules(AssetFormSchema.partial()).openapi('UpdateAssetRequest')

/**
 * Response schema for creating a new asset
 */
export const CreateAssetResponseSchema = SuccessResponseSchema(AssetDataSchema).openapi('CreateAssetResponse')

/**
 * Response schema for updating an existing asset
 */
export const UpdateAssetResponseSchema = SuccessResponseSchema().openapi('UpdateAssetResponse')

/**
 * Response schema for deleting an asset
 */
export const DeleteAssetResponseSchema = SuccessResponseSchema().openapi('DeleteAssetResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Id parameter schema for referencing specific assets in path parameters
 */
export const AssetParamsIdSchema = AssetSchema.pick({
    id: true
}).openapi('AssetParamsId')

/**
 * Asset filters schema representing the structure of filters that can be applied when querying assets
 */
export const AssetFiltersSchema = z
    .object({
        id: AssetParamsIdSchema.optional(),
        title: StringFilterSchema.optional(),
        type: AssetTypeEnum.optional(),
        symbol: StringFilterSchema.optional(),
        currency: CurrencyEnum.optional(),
        currentValueAsOf: DateFilterSchema.optional()
    })
    .openapi('AssetFilters')

/**
 * Query schema for asset filters
 */
export const QueryAssetFiltersSchema = ReadQuerySchema(AssetFiltersSchema).openapi('QueryAssetFilters')

/**
 * Union schema for asset creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateAssetRequestSchema = z
    .union([CreateAssetRequestSchema, UpdateAssetRequestSchema])
    .openapi('CreateUpdateAssetRequest')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Asset transaction schema representing a transaction linked to an asset
 */
export const AssetTransactionSchema = z
    .object({
        id: z.string().uuid(),
        assetId: z.string().uuid(),
        type: AssetTransactionTypeEnum,
        date: z.string().datetime(),
        settlementDate: z.string().datetime().nullable(),
        quantityChange: z.number().nullable(),
        unitPrice: z.number().nullable(),
        totalAmount: z.number().nullable(),
        currency: CurrencyEnum,
        fxRate: z.number().nullable(),
        fees: z.number().nullable(),
        taxAmount: z.number().nullable(),
        financialAccountId: z.string().uuid().nullable(),
        note: z.string().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().nullable()
    })
    .openapi('AssetTransaction')

/**
 * Response schema for getting asset transaction data (excluding deletedAt)
 */
export const AssetTransactionDataSchema = AssetTransactionSchema.omit({
    deletedAt: true
}).openapi('AssetTransactionData')

/**
 * Response schema for getting a list of asset transactions
 */
export const GetAssetTransactionListResponseSchema = SuccessResponseSchema(AssetTransactionDataSchema.array()).openapi(
    'GetAssetTransactionListResponse'
)

/**
 * Response schema for getting a single asset transaction by ID
 */
export const GetAssetTransactionResponseSchema =
    SuccessResponseSchema(AssetTransactionDataSchema).openapi('GetAssetTransactionResponse')

/**
 * Asset transaction form schema representing the data structure for asset transaction creation and editing forms
 */
export const AssetTransactionFormSchema = AssetTransactionSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('AssetTransactionForm')

/**
 * Cross-field rules applied on top of AssetTransactionFormSchema:
 * - Certain transaction types require quantityChange
 * - BUY and SELL require either unitPrice or totalAmount
 */
const refineAssetTransactionRules = <T extends z.ZodTypeAny>(schema: T) =>
    schema.superRefine((data: any, ctx) => {
        if (!data?.type) return

        const quantityRequiredTypes = new Set(['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'CAPITAL_CALL', 'DISTRIBUTION'])
        if (quantityRequiredTypes.has(data.type) && data.quantityChange == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['quantityChange'],
                message: `quantityChange is required for transaction type ${data.type}`
            })
        }

        const priceRequiredTypes = new Set(['BUY', 'SELL'])
        if (priceRequiredTypes.has(data.type) && data.unitPrice == null && data.totalAmount == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['unitPrice'],
                message: `unitPrice or totalAmount is required for transaction type ${data.type}`
            })
        }
    })

/**
 * Request schema for creating a new asset transaction
 */
export const CreateAssetTransactionRequestSchema = refineAssetTransactionRules(AssetTransactionFormSchema).openapi(
    'CreateAssetTransactionRequest'
)

/**
 * Request schema for updating an existing asset transaction
 */
export const UpdateAssetTransactionRequestSchema = refineAssetTransactionRules(
    AssetTransactionFormSchema.partial()
).openapi('UpdateAssetTransactionRequest')

/**
 * Response schema for creating a new asset transaction
 */
export const CreateAssetTransactionResponseSchema = SuccessResponseSchema(AssetTransactionDataSchema).openapi(
    'CreateAssetTransactionResponse'
)

/**
 * Response schema for updating an existing asset transaction
 */
export const UpdateAssetTransactionResponseSchema = SuccessResponseSchema().openapi('UpdateAssetTransactionResponse')

/**
 * Response schema for deleting an asset transaction
 */
export const DeleteAssetTransactionResponseSchema = SuccessResponseSchema().openapi('DeleteAssetTransactionResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Id parameter schema for referencing specific asset transactions in path parameters
 */
export const AssetTransactionParamsIdSchema = AssetTransactionSchema.pick({
    id: true
}).openapi('AssetTransactionParamsId')

/**
 * Asset transaction filters schema representing the structure of filters that can be applied when querying asset transactions
 */
export const AssetTransactionFiltersSchema = z
    .object({
        id: AssetTransactionParamsIdSchema.optional(),
        assetId: z.string().uuid().optional(),
        type: AssetTransactionTypeEnum.optional(),
        date: DateFilterSchema.optional(),
        financialAccountId: z.string().uuid().optional(),
        note: StringFilterSchema.optional()
    })
    .openapi('AssetTransactionFilters')

/**
 * Query schema for asset transaction filters
 */
export const QueryAssetTransactionFiltersSchema =
    ReadQuerySchema(AssetTransactionFiltersSchema).openapi('QueryAssetTransactionFilters')

/**
 * Union schema for asset transaction creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateAssetTransactionRequestSchema = z
    .union([CreateAssetTransactionRequestSchema, UpdateAssetTransactionRequestSchema])
    .openapi('CreateUpdateAssetTransactionRequest')
