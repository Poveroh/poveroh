import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AssetParamsIdSchema,
    CreateVehicleAssetMultipartRequestSchema,
    ErrorResponseSchema,
    GetAssetResponseSchema,
    UpdateVehicleAssetMultipartRequestSchema
} from '../schemas'

export const registerVehicleAssetPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/assets/vehicle',
        tags: ['Vehicle Asset'],
        operationId: 'createVehicleAsset',
        summary: 'Create vehicle asset',
        description: 'Create a vehicle asset together with its parent asset record and an optional brand logo',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateVehicleAssetMultipartRequestSchema,
                        encoding: { data: { contentType: 'application/json' } }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Vehicle asset created',
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
        path: '/assets/{id}/vehicle',
        tags: ['Vehicle Asset'],
        operationId: 'updateVehicleAsset',
        summary: 'Update vehicle asset',
        description: 'Update vehicle asset details, its parent asset value and an optional brand logo',
        security: [{ bearerAuth: [] }],
        request: {
            params: AssetParamsIdSchema,
            body: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: UpdateVehicleAssetMultipartRequestSchema,
                        encoding: { data: { contentType: 'application/json' } }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Vehicle asset updated',
                content: { 'application/json': { schema: GetAssetResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            404: {
                description: 'Vehicle asset not found',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
