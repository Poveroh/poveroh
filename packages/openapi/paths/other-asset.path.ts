import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    CreateOtherAssetRequestSchema,
    ErrorResponseSchema,
    GetAssetResponseSchema,
    UpdateOtherAssetRequestSchema
} from '../schemas'

export const registerOtherAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/assets/other',
        tags: ['Other Asset'],
        operationId: 'createOtherAsset',
        summary: 'Create other asset',
        description: 'Create an other asset together with its parent asset record',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: { 'application/json': { schema: CreateOtherAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Other asset created',
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
        path: '/assets/{id}/other',
        tags: ['Other Asset'],
        operationId: 'updateOtherAsset',
        summary: 'Update other asset',
        description: 'Update other asset details and its parent asset value',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: { 'application/json': { schema: UpdateOtherAssetRequestSchema } }
            }
        },
        responses: {
            200: {
                description: 'Other asset updated',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Other asset not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
