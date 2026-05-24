import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    UpdateUserSchemaRequest,
    ErrorResponseSchema,
    GetUserResponseSchema,
    UpdateUserResponseSchema,
    GetUserPreferencesResponseSchema,
    UpdateUserPreferencesSchemaRequest,
    UpdateUserPreferencesResponseSchema
} from '../schemas'

export const registerUserPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/user/me',
        tags: ['User'],
        operationId: 'getAuthenticatedUser',
        summary: 'Get authenticated user',
        description: 'Get authenticated user information and preferences',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'User found',
                content: {
                    'application/json': {
                        schema: GetUserResponseSchema
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
        path: '/user/me',
        tags: ['User'],
        operationId: 'updateAuthenticatedUser',
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
                        schema: UpdateUserResponseSchema
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
    registry.registerPath({
        method: 'get',
        path: '/user/me/preferences',
        tags: ['User'],
        operationId: 'getAuthenticatedUserPreferences',
        summary: 'Get authenticated user preferences',
        description: 'Get the preferences for the authenticated user. Creates defaults if none exist.',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'User preferences found',
                content: {
                    'application/json': {
                        schema: GetUserPreferencesResponseSchema
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
        path: '/user/me/preferences',
        tags: ['User'],
        operationId: 'updateAuthenticatedUserPreferences',
        summary: 'Update authenticated user preferences',
        description: "Updates the authenticated user's preferences. Creates defaults if none exist.",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: UpdateUserPreferencesSchemaRequest
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'User preferences updated',
                content: {
                    'application/json': {
                        schema: UpdateUserPreferencesResponseSchema
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
