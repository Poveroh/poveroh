import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    CreateSnapshotAccountBalanceRequestSchema,
    ErrorResponseSchema,
    CreateSnapshotAccountBalanceResponseSchema
} from '../schemas'

export const registerSnapshotPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/account-balance',
        tags: ['Snapshot'],
        summary: 'Create snapshot account balance',
        description: 'Create a new snapshot account balance with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Snapshot account balance data to create',
                required: true,
                content: {
                    'application/json': {
                        schema: CreateSnapshotAccountBalanceRequestSchema,
                        encoding: {
                            data: {
                                contentType: 'application/json'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Snapshot account balance created',
                content: {
                    'application/json': {
                        schema: CreateSnapshotAccountBalanceResponseSchema
                    }
                }
            },
            400: {
                description: 'Invalid request',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            401: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            }
        }
    })
}
