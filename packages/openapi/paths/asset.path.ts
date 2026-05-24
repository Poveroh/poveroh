import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    DeleteAssetResponseSchema,
    ErrorResponseSchema,
    GetAssetListResponseSchema,
    GetAssetResponseSchema,
    QueryAssetFiltersSchema
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
}
