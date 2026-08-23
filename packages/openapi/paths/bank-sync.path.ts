import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    BankSyncConnectionPathParamsSchema,
    BankSyncProviderPathParamsSchema,
    CompleteBankSyncConnectionRequestSchema,
    CompleteBankSyncConnectionResponseSchema,
    CreateBankSyncConnectionRequestSchema,
    CreateBankSyncConnectionResponseSchema,
    DeleteBankSyncConnectionResponseSchema,
    DeleteBankSyncProviderAppCredentialResponseSchema,
    ErrorResponseSchema,
    GetBankSyncProvidersResponseSchema,
    LinkBankSyncAccountsRequestSchema,
    LinkBankSyncAccountsResponseSchema,
    ListBankSyncConnectionsResponseSchema,
    ListExternalBankAccountsResponseSchema,
    TriggerBankSyncResponseSchema,
    UpdateBankSyncProviderAppCredentialRequestSchema,
    UpdateBankSyncProviderAppCredentialResponseSchema
} from '../schemas'

export const registerBankSyncPath = (registry: OpenAPIRegistry) => {
    // GET /bank-sync/providers
    registry.registerPath({
        method: 'get',
        path: '/bank-sync/providers',
        tags: ['Bank Sync'],
        operationId: 'getBankSyncProviders',
        summary: 'Get bank-sync providers',
        description:
            'List the enabled open-banking providers and how many connections the current user has per provider',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Provider list',
                content: { 'application/json': { schema: GetBankSyncProvidersResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // PUT /bank-sync/providers/{providerId}/app-credential
    registry.registerPath({
        method: 'put',
        path: '/bank-sync/providers/{providerId}/app-credential',
        tags: ['Bank Sync'],
        operationId: 'saveBankSyncProviderAppCredential',
        summary: 'Save a provider app-level credential',
        description:
            "Encrypts and stores the self-hosted instance owner's own app-level credentials for a provider (e.g. a Plaid client id/secret), reused across every connection made to it",
        security: [{ bearerAuth: [] }],
        request: {
            params: BankSyncProviderPathParamsSchema,
            body: { content: { 'application/json': { schema: UpdateBankSyncProviderAppCredentialRequestSchema } } }
        },
        responses: {
            200: {
                description: 'Credential saved',
                content: { 'application/json': { schema: UpdateBankSyncProviderAppCredentialResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // DELETE /bank-sync/providers/{providerId}/app-credential
    registry.registerPath({
        method: 'delete',
        path: '/bank-sync/providers/{providerId}/app-credential',
        tags: ['Bank Sync'],
        operationId: 'deleteBankSyncProviderAppCredential',
        summary: 'Delete a provider app-level credential',
        description: "Deletes the authenticated user's encrypted app-level credential for a provider",
        security: [{ bearerAuth: [] }],
        request: { params: BankSyncProviderPathParamsSchema },
        responses: {
            200: {
                description: 'Credential deleted',
                content: { 'application/json': { schema: DeleteBankSyncProviderAppCredentialResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // GET /bank-sync/connections
    registry.registerPath({
        method: 'get',
        path: '/bank-sync/connections',
        tags: ['Bank Sync'],
        operationId: 'listBankSyncConnections',
        summary: 'List bank connections',
        description: "List the authenticated user's bank connections",
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Connection list',
                content: { 'application/json': { schema: ListBankSyncConnectionsResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // POST /bank-sync/connections
    registry.registerPath({
        method: 'post',
        path: '/bank-sync/connections',
        tags: ['Bank Sync'],
        operationId: 'createBankSyncConnection',
        summary: 'Start a bank connection',
        description: 'Starts a hosted connect flow, or completes a credentials-flow connection inline',
        security: [{ bearerAuth: [] }],
        request: { body: { content: { 'application/json': { schema: CreateBankSyncConnectionRequestSchema } } } },
        responses: {
            200: {
                description: 'Connection started or linked',
                content: { 'application/json': { schema: CreateBankSyncConnectionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // POST /bank-sync/connections/{connectionId}/complete
    registry.registerPath({
        method: 'post',
        path: '/bank-sync/connections/{connectionId}/complete',
        tags: ['Bank Sync'],
        operationId: 'completeBankSyncConnection',
        summary: 'Complete a hosted bank connection',
        description: "Exchanges the provider's hosted-flow callback payload and links the connection",
        security: [{ bearerAuth: [] }],
        request: {
            params: BankSyncConnectionPathParamsSchema,
            body: { content: { 'application/json': { schema: CompleteBankSyncConnectionRequestSchema } } }
        },
        responses: {
            200: {
                description: 'Connection linked',
                content: { 'application/json': { schema: CompleteBankSyncConnectionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Connection not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // GET /bank-sync/connections/{connectionId}/accounts
    registry.registerPath({
        method: 'get',
        path: '/bank-sync/connections/{connectionId}/accounts',
        tags: ['Bank Sync'],
        operationId: 'listBankSyncExternalAccounts',
        summary: 'List external accounts on a connection',
        description:
            'Lists the accounts the provider reports for this connection, before mapping to a FinancialAccount',
        security: [{ bearerAuth: [] }],
        request: { params: BankSyncConnectionPathParamsSchema },
        responses: {
            200: {
                description: 'External account list',
                content: { 'application/json': { schema: ListExternalBankAccountsResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Connection not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // POST /bank-sync/connections/{connectionId}/accounts
    registry.registerPath({
        method: 'post',
        path: '/bank-sync/connections/{connectionId}/accounts',
        tags: ['Bank Sync'],
        operationId: 'linkBankSyncAccounts',
        summary: 'Map external accounts to FinancialAccounts',
        description:
            'Persists the mapping between the connection external accounts and existing or newly created FinancialAccounts',
        security: [{ bearerAuth: [] }],
        request: {
            params: BankSyncConnectionPathParamsSchema,
            body: { content: { 'application/json': { schema: LinkBankSyncAccountsRequestSchema } } }
        },
        responses: {
            200: {
                description: 'Accounts linked',
                content: { 'application/json': { schema: LinkBankSyncAccountsResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Connection not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // POST /bank-sync/connections/{connectionId}/sync
    registry.registerPath({
        method: 'post',
        path: '/bank-sync/connections/{connectionId}/sync',
        tags: ['Bank Sync'],
        operationId: 'triggerBankSync',
        summary: 'Trigger a manual sync',
        description: 'Dispatches the same sync job the nightly cron uses, for this connection only',
        security: [{ bearerAuth: [] }],
        request: { params: BankSyncConnectionPathParamsSchema },
        responses: {
            200: {
                description: 'Sync dispatched',
                content: { 'application/json': { schema: TriggerBankSyncResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Connection not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // DELETE /bank-sync/connections/{connectionId}
    registry.registerPath({
        method: 'delete',
        path: '/bank-sync/connections/{connectionId}',
        tags: ['Bank Sync'],
        operationId: 'deleteBankSyncConnection',
        summary: 'Revoke a bank connection',
        description: 'Soft-deletes the connection and wipes its encrypted secret',
        security: [{ bearerAuth: [] }],
        request: { params: BankSyncConnectionPathParamsSchema },
        responses: {
            200: {
                description: 'Connection revoked',
                content: { 'application/json': { schema: DeleteBankSyncConnectionResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Connection not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
