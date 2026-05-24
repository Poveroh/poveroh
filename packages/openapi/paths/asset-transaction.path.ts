import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetTransactionParamsIdSchema,
    CreateAssetTransactionRequestSchema,
    CreateAssetTransactionResponseSchema,
    DeleteAssetTransactionResponseSchema,
    ErrorResponseSchema,
    GetAssetTransactionListResponseSchema,
    GetAssetTransactionResponseSchema,
    QueryAssetTransactionFiltersSchema,
    UpdateAssetTransactionRequestSchema,
    UpdateAssetTransactionResponseSchema
} from '../schemas'

export const registerAssetTransactionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/assets/transactions',
        tags: ['Asset Transaction'],
        operationId: 'getAssetTransactions',
        summary: 'Get asset transactions',
        description: 'Retrieve the asset transactions associated with the authenticated user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryAssetTransactionFiltersSchema
        },
        responses: {
            200: {
                description: 'Asset transaction list',
                content: { 'application/json': { schema: GetAssetTransactionListResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/assets/transactions/{id}',
        tags: ['Asset Transaction'],
        operationId: 'getAssetTransactionById',
        summary: 'Get asset transaction by ID',
        description: 'Retrieve a single asset transaction',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetTransactionParamsIdSchema
        },
        responses: {
            200: {
                description: 'Asset transaction found',
                content: { 'application/json': { schema: GetAssetTransactionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Asset transaction not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/assets/transactions',
        tags: ['Asset Transaction'],
        operationId: 'createAssetTransaction',
        summary: 'Create asset transaction',
        description: 'Create a new transaction for an asset',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateAssetTransactionRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Asset transaction created',
                content: { 'application/json': { schema: CreateAssetTransactionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'patch',
        path: '/assets/transactions/{id}',
        tags: ['Asset Transaction'],
        operationId: 'updateAssetTransaction',
        summary: 'Update asset transaction',
        description: 'Update an existing transaction for an asset',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetTransactionParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateAssetTransactionRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Asset transaction updated',
                content: { 'application/json': { schema: UpdateAssetTransactionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Asset transaction not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/assets/transactions/{id}',
        tags: ['Asset Transaction'],
        operationId: 'deleteAssetTransaction',
        summary: 'Delete asset transaction',
        description: 'Soft delete an asset transaction',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetTransactionParamsIdSchema
        },
        responses: {
            200: {
                description: 'Asset transaction deleted',
                content: { 'application/json': { schema: DeleteAssetTransactionResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Asset transaction not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/assets/transactions',
        tags: ['Asset Transaction'],
        operationId: 'deleteAssetTransactions',
        summary: 'Delete all asset transactions',
        description: 'Soft delete all asset transactions for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Asset transactions deleted',
                content: { 'application/json': { schema: DeleteAssetTransactionResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
