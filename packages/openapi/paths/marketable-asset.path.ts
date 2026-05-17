import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetDataSchema,
    AssetParamsIdSchema,
    CreateMarketableAssetRequestSchema,
    ErrorResponseSchema,
    GetAssetResponseSchema,
    UpdateMarketableAssetRequestSchema
} from '../schemas'

export const registerMarketableAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/assets/marketable',
        tags: ['Marketable Asset'],
        operationId: 'createMarketableAsset',
        summary: 'Create marketable asset',
        description: 'Create a marketable asset with its opening transaction',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateMarketableAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Marketable asset created',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
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
        path: '/assets/{id}/marketable',
        tags: ['Marketable Asset'],
        operationId: 'updateMarketableAsset',
        summary: 'Update marketable asset',
        description: 'Update marketable asset metadata without creating transactions',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateMarketableAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Marketable asset updated',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Marketable asset not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
