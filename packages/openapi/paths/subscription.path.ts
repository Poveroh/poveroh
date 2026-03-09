import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    QuerySubscriptionFiltersSchema,
    CreateSubscriptionMultipartRequestSchema,
    UpdateSubscriptionRequestSchema,
    SubscriptionParamsId,
    GetSubscriptionListResponseSchema,
    GetSubscriptionResponseSchema,
    CreateSubscriptionResponseSchema,
    UpdateSubscriptionResponseSchema,
    DeleteSubscriptionResponseSchema
} from '../schemas'

export const registerSubscriptionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/subscriptions',
        tags: ['Subscription'],
        operationId: 'getSubscriptions',
        summary: 'Get all subscriptions',
        description: 'Retrieve a list of all subscriptions associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QuerySubscriptionFiltersSchema
        },
        responses: {
            200: {
                description: 'List of subscriptions',
                content: {
                    'application/json': {
                        schema: GetSubscriptionListResponseSchema
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
                description: 'Subscription not found',
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
        path: '/subscriptions/{id}',
        tags: ['Subscription'],
        operationId: 'getSubscriptionById',
        summary: 'Get subscription by ID',
        description: 'Retrieve a specific subscription by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubscriptionParamsId.describe('ID of the subscription to retrieve')
        },
        responses: {
            200: {
                description: 'Subscription found',
                content: {
                    'application/json': {
                        schema: GetSubscriptionResponseSchema
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
                description: 'Subscription not found',
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
        method: 'post',
        path: '/subscriptions',
        tags: ['Subscription'],
        operationId: 'createSubscription',
        summary: 'Create subscription',
        description: 'Create a new subscription with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Subscription data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateSubscriptionMultipartRequestSchema,
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
                description: 'Subscription created',
                content: {
                    'application/json': {
                        schema: CreateSubscriptionResponseSchema
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
    registry.registerPath({
        method: 'patch',
        path: '/subscriptions/{id}',
        tags: ['Subscription'],
        operationId: 'updateSubscription',
        summary: 'Update subscription',
        description: 'Update an existing subscription with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubscriptionParamsId.describe('ID of the subscription to update'),
            body: {
                description: 'Subscription data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateSubscriptionRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Subscription updated',
                content: {
                    'application/json': {
                        schema: UpdateSubscriptionResponseSchema
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
                description: 'Financial account not found',
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
        method: 'delete',
        path: '/subscriptions/{id}',
        tags: ['Subscription'],
        operationId: 'deleteSubscription',
        summary: 'Delete subscription',
        description: 'Delete an existing subscription with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubscriptionParamsId.describe('ID of the subscription to delete')
        },
        responses: {
            200: {
                description: 'Subscription deleted',
                content: {
                    'application/json': {
                        schema: DeleteSubscriptionResponseSchema
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
                description: 'Subscription not found',
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
