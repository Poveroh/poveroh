import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { UserSchema } from '@poveroh/schemas'
import { UpdateUserSchemaRequest, ErrorResponseSchema, SuccessResponseSchema } from '../schemas'

export const registerUserPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/user',
        tags: ['User'],
        summary: 'Get user',
        description: 'Get user information and preferences',
        responses: {
            200: {
                description: 'User found',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(UserSchema)
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
                description: 'User not found',
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
        path: '/user',
        tags: ['User'],
        summary: 'Update user',
        description: 'Update user preferences and information',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: UpdateUserSchemaRequest
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'User updated',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(UserSchema)
                    }
                }
            },
            400: {
                description: 'Invalid request body',
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
                description: 'User not found',
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
