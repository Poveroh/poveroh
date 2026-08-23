import { z } from '../zod'
import {
    BankSyncConnectFlowEnum,
    BankSyncConnectionStatusEnum,
    BankSyncConnectMechanismEnum,
    BankSyncProviderKindEnum,
    CurrencyEnum
} from './enum.schema'
import { SimpleSuccessResponseSchema, SuccessResponseSchema } from './response.schema'

/**
 * Generic key/value credential map, shared by connection credentials, provider secrets, and
 * app-level credentials wherever a provider-defined set of string fields is submitted or stored
 */
export const BankSyncCredentialInputSchema = z.record(z.string(), z.any()).openapi('BankSyncCredentialInput')

/**
 * External bank account schema as reported by the provider, before it is mapped to a FinancialAccount
 */
export const ExternalBankAccountSchema = z
    .object({
        externalAccountId: z.string().nonempty(),
        name: z.string().nonempty(),
        currency: z.string().nonempty(),
        mask: z.string().optional(),
        financialAccountId: z.uuid().optional()
    })
    .openapi('ExternalBankAccount')

/**
 * Response schema for listing the external accounts available on a connection, before mapping
 */
export const ListExternalBankAccountsResponseSchema = SuccessResponseSchema(ExternalBankAccountSchema.array()).openapi(
    'ListExternalBankAccountsResponse'
)

/**
 * One external-account-to-FinancialAccount mapping: either an existing account id, or the
 * details to create a new one
 */
export const BankSyncAccountMappingSchema = z
    .object({
        externalAccountId: z.string().nonempty(),
        financialAccountId: z.string().nonempty()
    })
    .openapi('BankSyncAccountMapping')

/**
 * Request schema for persisting the mapping between a connection's external accounts and FinancialAccounts
 */
export const LinkBankSyncAccountsRequestSchema = z
    .object({
        mappings: z.array(BankSyncAccountMappingSchema).nonempty()
    })
    .openapi('LinkBankSyncAccountsRequest')

/**
 * Request schema for creating a new bank sync account
 */
export const CreateBankSyncAccountRequestSchema = z
    .object({
        connectionId: z.uuid(),
        financialAccountId: z.uuid(),
        externalAccountId: z.string().nonempty(),
        externalAccountName: z.string().nullable(),
        currency: CurrencyEnum.nullable()
    })
    .openapi('CreateBankSyncAccountRequest')

/**
 * Bank sync account form schema representing the data structure for linking accounts
 */
export const LinkBankSyncAccountFormSchema = LinkBankSyncAccountsRequestSchema.openapi('LinkBankSyncAccountForm')

/**
 * Bank-sync account schema representing a persisted external-account-to-FinancialAccount mapping
 */
export const BankSyncAccountSchema = z
    .object({
        id: z.uuid(),
        externalAccountId: z.string().nonempty(),
        externalAccountName: z.string().nullable(),
        financialAccountId: z.uuid(),
        lastSyncedAt: z.string().datetime().nullable()
    })
    .openapi('BankSyncAccount')

/**
 * Response schema for persisting account mappings
 */
export const LinkBankSyncAccountsResponseSchema = SuccessResponseSchema(BankSyncAccountSchema.array()).openapi(
    'LinkBankSyncAccountsResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Path params schema for operations scoped to a single provider's app-level credential
 */
export const BankSyncProviderPathParamsSchema = z
    .object({
        providerId: z.string().nonempty()
    })
    .openapi('BankSyncProviderPathParams')

/**
 * Request schema for saving a provider's app-level credentials (e.g. a Plaid client id/secret),
 * entered by the self-hosted instance owner — Poveroh never ships with any provider's own credentials.
 */
export const UpdateBankSyncProviderAppCredentialRequestSchema = z
    .object({
        credentials: BankSyncCredentialInputSchema
    })
    .openapi('UpdateBankSyncProviderAppCredentialRequest')

/**
 * Response schema for saving a provider's app-level credentials
 */
export const UpdateBankSyncProviderAppCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'UpdateBankSyncProviderAppCredentialResponse'
)

/**
 * Response schema for deleting a provider's app-level credentials
 */
export const DeleteBankSyncProviderAppCredentialResponseSchema = SimpleSuccessResponseSchema.openapi(
    'DeleteBankSyncProviderAppCredentialResponse'
)

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Path params schema for operations scoped to a single bank connection
 */
export const BankSyncConnectionPathParamsSchema = z
    .object({
        connectionId: z.uuid()
    })
    .openapi('BankSyncConnectionPathParams')

/**
 * Bank connection schema representing one connection to an open-banking provider
 */
export const BankSyncConnectionSchema = z
    .object({
        id: z.uuid(),
        userId: z.string().uuid(),
        providerId: z.string().nonempty(),
        status: BankSyncConnectionStatusEnum,
        externalConnectionId: z.string().nullable(),
        institutionName: z.string().nullable(),
        lastSyncedAt: z.string().datetime().nullable(),
        lastSyncError: z.string().nullable(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('BankSyncConnection')

/**
 * Bank connection schema representing one connection without userId
 */
export const BankSyncConnectionDataSchema = BankSyncConnectionSchema.omit({
    userId: true
}).openapi('BankSyncConnectionData')

/**
 * Response schema for listing the authenticated user's bank connections
 */
export const ListBankSyncConnectionsResponseSchema = SuccessResponseSchema(
    BankSyncConnectionDataSchema.array()
).openapi('ListBankSyncConnectionsResponse')

/**
 * Request schema for starting a new bank connection, either launching a hosted flow or
 * submitting the credentials fields the provider's registry entry declares
 */
export const CreateBankSyncConnectionRequestSchema = z
    .object({
        providerId: z.string().nonempty(),
        credentials: BankSyncCredentialInputSchema.optional(),
        appCredentials: BankSyncCredentialInputSchema.optional()
    })
    .openapi('CreateBankSyncConnectionRequest')

/**
 * Bank connection response payload: the connection resource together with the connect URL to
 * launch when a hosted flow is still pending
 */
export const BankSyncConnectionWithConnectUrlResponseSchema = z
    .object({
        connection: BankSyncConnectionSchema,
        connectUrl: z.string().nullable()
    })
    .openapi('BankSyncConnectionWithConnectUrlResponse')

/**
 * Response schema for starting a new bank connection: `connectUrl` is set for hosted-flow
 * providers (open the widget/redirect with it), null for credentials-flow providers that are
 * already linked by the time this responds
 */
export const CreateBankSyncConnectionResponseSchema = SuccessResponseSchema(
    BankSyncConnectionWithConnectUrlResponseSchema
).openapi('CreateBankSyncConnectionResponse')

/**
 * Request schema for completing a hosted-flow connection with the provider's callback payload
 */
export const CompleteBankSyncConnectionRequestSchema = z
    .object({
        callbackPayload: BankSyncCredentialInputSchema.optional(),
        metadata: BankSyncCredentialInputSchema.optional()
    })
    .openapi('CompleteBankSyncConnectionRequest')

/**
 * Response schema for completing a bank connection
 */
export const CompleteBankSyncConnectionResponseSchema = SuccessResponseSchema(BankSyncConnectionSchema).openapi(
    'CompleteBankSyncConnectionResponse'
)

/**
 * Response schema for deleting (revoking) a bank connection
 */
export const DeleteBankSyncConnectionResponseSchema = SimpleSuccessResponseSchema.openapi(
    'DeleteBankSyncConnectionResponse'
)

/**
 * Response schema for manually triggering a sync run for a connection
 */
export const TriggerBankSyncResponseSchema = SimpleSuccessResponseSchema.openapi('TriggerBankSyncResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * One credential field a `credentials`-flow provider needs from the user
 */
export const BankSyncCredentialFieldSchema = z
    .object({
        key: z.string().nonempty(),
        label: z.string().nonempty(),
        secret: z.boolean().optional()
    })
    .openapi('BankSyncCredentialField')

/**
 * Bank-sync provider schema representing an available open-banking integration
 */
export const BankSyncProviderSchema = z
    .object({
        id: z.string().nonempty(),
        label: z.string().nonempty(),
        logoUrl: z.string().url(),
        kind: BankSyncProviderKindEnum,
        connectFlow: BankSyncConnectFlowEnum,
        connectMechanism: BankSyncConnectMechanismEnum.optional(),
        credentialFields: z.array(BankSyncCredentialFieldSchema),
        appCredentialFields: z.array(BankSyncCredentialFieldSchema),
        enabled: z.boolean(),
        connectionCount: z.number().int().nonnegative(),
        configured: z.boolean()
    })
    .openapi('BankSyncProvider')

/**
 * Response schema for getting the list of enabled bank-sync providers
 */
export const GetBankSyncProvidersResponseSchema = SuccessResponseSchema(BankSyncProviderSchema.array()).openapi(
    'GetBankSyncProvidersResponse'
)
