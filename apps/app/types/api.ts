/**
 * Type aliases for OpenAPI generated types
 * This file provides backwards compatibility during migration
 * TODO: Eventually remove this file and import directly from @/lib/api-client
 */

import type {
    Transaction,
    Category,
    Subcategory,
    FinancialAccount,
    SnapshotAccountBalance,
    User,
    Subscription,
    Import,
    ImportsFile,
    NetWorthEvolutionDataPoint,
    NetWorthEvolutionReport,
    TransactionFilters,
    CategoryFilters,
    SubcategoryFilters,
    FinancialAccountFilters,
    SubscriptionFilters,
    NetWorthEvolutionFilters,
    FilterOptions
} from '@/lib/api-client'

// Entity type aliases
export type ITransaction = Transaction
export type ICategory = Category
export type ISubcategory = Subcategory
export type IFinancialAccount = FinancialAccount
export type ISnapshotAccountBalance = SnapshotAccountBalance
export type IUser = User
export type ISubscription = Subscription
export type IImport = Import
export type IImportsFile = ImportsFile

// Report type aliases
export type INetWorthEvolutionDataPoint = NetWorthEvolutionDataPoint
export type INetWorthEvolutionReport = NetWorthEvolutionReport

// Filter type aliases
export type ITransactionFilters = TransactionFilters
export type ICategoryFilters = CategoryFilters
export type ISubcategoryFilters = SubcategoryFilters
export type IFinancialAccountFilters = FinancialAccountFilters
export type ISubscriptionFilters = SubscriptionFilters
export type INetWorthEvolutionFilters = NetWorthEvolutionFilters
export type IFilterOptions = FilterOptions
