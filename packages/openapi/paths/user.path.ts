import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { UpdateUserSchemaRequest, ErrorResponseSchema, SuccessResponseSchema, UserSchema } from '../schemas'

export const registerUserPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/me',
        tags: ['User'],
        summary: 'Get authenticated user',
        description: 'Get authenticated user information and preferences',
        security: [{ bearerAuth: [] }],
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
                description: 'Authenticated user not found',
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
        method: 'patch',
        path: '/me',
        tags: ['User'],
        summary: 'Update authenticated user',
        description:
            "Updates the authenticated user's profile. Email changes require verification and may be subject to additional security checks.",
        security: [{ bearerAuth: [] }],
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
                description: 'Authenticated user not found',
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
