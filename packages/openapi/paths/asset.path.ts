import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    AssetTransactionParamsIdSchema,
    CreateAssetRequestSchema,
    CreateAssetResponseSchema,
    CreateAssetTransactionRequestSchema,
    CreateAssetTransactionResponseSchema,
    DeleteAssetResponseSchema,
    DeleteAssetTransactionResponseSchema,
    ErrorResponseSchema,
    GetAssetListResponseSchema,
    GetAssetResponseSchema,
    GetAssetTransactionListResponseSchema,
    GetAssetTransactionResponseSchema,
    GetPortfolioSummaryResponseSchema,
    QueryAssetFiltersSchema,
    QueryAssetTransactionFiltersSchema,
    UpdateAssetRequestSchema,
    UpdateAssetResponseSchema,
    UpdateAssetTransactionRequestSchema,
    UpdateAssetTransactionResponseSchema
} from '../schemas'

export const registerAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/assets',
        tags: ['Asset'],
        operationId: 'getAssets',
        summary: 'Get all assets',
        description: 'Retrieve the investment assets associated with the authenticated user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryAssetFiltersSchema
        },
        responses: {
            200: { description: 'Asset list', content: { 'application/json': { schema: GetAssetListResponseSchema } } },
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
        path: '/assets/summary/portfolio',
        tags: ['Asset'],
        operationId: 'getPortfolioSummary',
        summary: 'Get portfolio summary',
        description: 'Retrieve aggregated metrics for the investment portfolio',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Portfolio summary',
                content: { 'application/json': { schema: GetPortfolioSummaryResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/assets/{id}',
        tags: ['Asset'],
        operationId: 'getAssetById',
        summary: 'Get asset by ID',
        description: 'Retrieve a single asset and its normalized subtype data',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema
        },
        responses: {
            200: { description: 'Asset found', content: { 'application/json': { schema: GetAssetResponseSchema } } },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/assets',
        tags: ['Asset'],
        operationId: 'createAsset',
        summary: 'Create asset',
        description: 'Create a new asset with subtype details',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Asset created',
                content: { 'application/json': { schema: CreateAssetResponseSchema } }
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
        path: '/assets/{id}',
        tags: ['Asset'],
        operationId: 'updateAsset',
        summary: 'Update asset',
        description: 'Update an existing asset and its subtype details',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Asset updated',
                content: { 'application/json': { schema: UpdateAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/assets/{id}',
        tags: ['Asset'],
        operationId: 'deleteAsset',
        summary: 'Delete asset',
        description: 'Soft delete an asset',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema
        },
        responses: {
            200: {
                description: 'Asset deleted',
                content: { 'application/json': { schema: DeleteAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/assets',
        tags: ['Asset'],
        operationId: 'deleteAssets',
        summary: 'Delete all assets',
        description: 'Soft delete all assets for the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Assets deleted',
                content: { 'application/json': { schema: DeleteAssetResponseSchema } }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/asset-transactions',
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
        path: '/asset-transactions/{id}',
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
        path: '/asset-transactions',
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
        path: '/asset-transactions/{id}',
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
        path: '/asset-transactions/{id}',
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
        path: '/asset-transactions',
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
