import { Prisma } from '@poveroh/prisma'

export const subcategorySelect = {
    id: true,
    categoryId: true,
    title: true,
    icon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubcategorySelect

export const categorySelect = {
    id: true,
    title: true,
    for: true,
    icon: true,
    color: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.CategorySelect

export const categoryWithSubcategoriesSelect = {
    ...categorySelect,
    subcategories: {
        where: { deletedAt: null },
        select: subcategorySelect
    }
} satisfies Prisma.CategorySelect

export const financialAccountSelect = {
    id: true,
    title: true,
    type: true,
    logoIcon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.FinancialAccountSelect

export const financialAccountWithoutBalanceSelect = {
    id: true,
    title: true,
    balance: true,
    type: true,
    logoIcon: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.FinancialAccountWithBalanceSelect

export const accountBalanceSelect = {
    id: true,
    financialAccountId: true,
    date: true,
    balance: true,
    note: true,
    isManual: true
} satisfies Prisma.FinancialAccountBalanceSelect

export const credentialSelect = {
    id: true,
    providerId: true,
    ciphertext: true,
    iv: true,
    authTag: true,
    algo: true
} satisfies Prisma.MarketDataProviderCredentialSelect

export const autoDepreciationSelect = {
    startDate: true,
    endDate: true,
    depreciationBase: true,
    depreciationType: true,
    depreciationValue: true,
    cyclePeriod: true,
    cycleNumber: true
} satisfies Prisma.AutoDepreciationSelect

export const assetTransactionSelect = {
    id: true,
    assetId: true,
    type: true,
    date: true,
    settlementDate: true,
    quantityChange: true,
    unitPrice: true,
    totalAmount: true,
    currency: true,
    fxRate: true,
    fees: true,
    taxAmount: true,
    financialAccountId: true,
    note: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.AssetTransactionSelect

export const assetSelect = {
    id: true,
    title: true,
    type: true,
    currency: true,
    currentValue: true,
    currentValueAsOf: true,
    quantity: true,
    totalInvested: true,
    createdAt: true,
    updatedAt: true,
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true,
    other: true,
    transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'desc' as const },
        select: assetTransactionSelect
    },
    autoDepreciations: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' as const },
        select: autoDepreciationSelect
    }
} satisfies Prisma.AssetSelect

export const vehicleSelect = {
    brand: true,
    model: true,
    type: true,
    year: true,
    purchasePrice: true,
    purchaseDate: true,
    plateNumber: true,
    vin: true,
    mileage: true,
    condition: true,
    logoIcon: true
} satisfies Prisma.VehicleAssetSelect

export const marketableSelect = {
    symbol: true,
    isin: true,
    exchange: true,
    assetClass: true,
    sector: true,
    region: true,
    lastPriceSync: true
} satisfies Prisma.MarketableAssetSelect

export const collectibleSelect = {
    acquisitionCost: true,
    acquisitionDate: true,
    appraisalValue: true,
    appraisalDate: true
} satisfies Prisma.CollectibleAssetSelect

export const realEstateSelect = {
    address: true,
    type: true,
    purchasePrice: true,
    purchaseDate: true
} satisfies Prisma.RealEstateAssetSelect

export const otherSelect = {
    description: true,
    purchasePrice: true,
    purchaseDate: true
} satisfies Prisma.OtherAssetSelect

export const subscriptionSelect = {
    id: true,
    title: true,
    description: true,
    amount: true,
    currency: true,
    appearanceMode: true,
    appearanceLogoIcon: true,
    appearanceIconColor: true,
    firstPayment: true,
    cycleNumber: true,
    cyclePeriod: true,
    rememberPeriod: true,
    financialAccountId: true,
    isEnabled: true,
    createdAt: true,
    updatedAt: true
} satisfies Prisma.SubscriptionSelect

export const userActivitySelect = {
    id: true,
    entityType: true,
    action: true,
    entityId: true,
    metadata: true,
    userAgent: true,
    createdAt: true
} satisfies Prisma.UserActivitySelect

export const snapshotSelect = {
    snapshotDate: true,
    totalNetWorth: true
} satisfies Prisma.SnapshotSelect
