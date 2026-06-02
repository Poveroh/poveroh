import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    CreateRealEstateAssetRequestSchema,
    ErrorResponseSchema,
    GetAssetResponseSchema,
    UpdateRealEstateAssetRequestSchema
} from '../schemas'

export const registerRealEstateAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/assets/real-estate',
        tags: ['Real Estate Asset'],
        operationId: 'createRealEstateAsset',
        summary: 'Create real estate asset',
        description: 'Create a real estate asset together with its parent asset record',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateRealEstateAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Real estate asset created',
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
        path: '/assets/{id}/real-estate',
        tags: ['Real Estate Asset'],
        operationId: 'updateRealEstateAsset',
        summary: 'Update real estate asset',
        description: 'Update real estate asset details and its parent asset value',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateRealEstateAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Real estate asset updated',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Real estate asset not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
