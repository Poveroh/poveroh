import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { ErrorResponseSchema, StatusResponseSchema } from '../schemas'

export const registerStatusPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/',
        tags: ['Status'],
        operationId: 'getRootStatus',
        summary: 'Healthcheck',
        responses: {
            200: {
                description: 'OK',
                content: {
                    'application/json': {
                        schema: StatusResponseSchema
                    }
                }
            },
            500: {
                description: 'Error',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/status',
        tags: ['Status'],
        operationId: 'getStatus',
        summary: 'Healthcheck',
        responses: {
            200: {
                description: 'OK',
                content: {
                    'application/json': {
                        schema: StatusResponseSchema
                    }
                }
            },
            500: {
                description: 'Error',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            }
        }
    })
}
