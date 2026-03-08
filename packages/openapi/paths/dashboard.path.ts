import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    SuccessResponseSchema,
    DashboardLayoutSchema,
    UpdateDashboardLayoutRequestSchema
} from '../schemas'

export const registerDashboardPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/dashboard',
        tags: ['Dashboard'],
        summary: 'Get dashboard layout',
        description: 'Retrieve a specific dashboard layout',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Dashboard layout found',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(DashboardLayoutSchema)
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
            404: {
                description: 'Dashboard layout not found',
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
    registry.registerPath({
        method: 'put',
        path: '/dashboard',
        tags: ['Dashboard'],
        summary: 'Update dashboard layout',
        description: 'Update a specific dashboard layout',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Dashboard layout data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateDashboardLayoutRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Dashboard layout updated successfully',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(DashboardLayoutSchema)
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
            404: {
                description: 'Dashboard layout not found',
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
