import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    CreateCollectibleAssetRequestSchema,
    ErrorResponseSchema,
    GetAssetResponseSchema,
    UpdateCollectibleAssetRequestSchema
} from '../schemas'

export const registerCollectibleAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/assets/collectible',
        tags: ['Collectible Asset'],
        operationId: 'createCollectibleAsset',
        summary: 'Create collectible asset',
        description: 'Create a collectible asset together with its parent asset record',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateCollectibleAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Collectible asset created',
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
        path: '/assets/{id}/collectible',
        tags: ['Collectible Asset'],
        operationId: 'updateCollectibleAsset',
        summary: 'Update collectible asset',
        description: 'Update collectible asset details and its parent asset value',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateCollectibleAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Collectible asset updated',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Collectible asset not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
