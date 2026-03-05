import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    SuccessResponseSchema,
    ReadQuerySchema,
    CreateTransactionMultipartRequestSchema,
    TransactionFiltersSchema,
    TransactionParamsId,
    TransactionSchema,
    UpdateTransactionRequestSchema
} from '../schemas'

export const registerTransactionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/transactions',
        tags: ['Transaction'],
        summary: 'Get all transactions',
        description: 'Retrieve a list of all transactions associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: ReadQuerySchema(TransactionFiltersSchema)
        },
        responses: {
            200: {
                description: 'List of transactions',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(TransactionSchema.array())
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
                description: 'Transaction not found',
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
        path: '/transactions/{id}',
        tags: ['Transaction'],
        summary: 'Get transaction by ID',
        description: 'Retrieve a specific transaction by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: TransactionParamsId.describe('ID of the transaction to retrieve')
        },
        responses: {
            200: {
                description: 'Transaction found',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(TransactionSchema)
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
                description: 'Transaction not found',
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
        path: '/transactions',
        tags: ['Transaction'],
        summary: 'Create transaction',
        description: 'Create a new transaction with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Transaction data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateTransactionMultipartRequestSchema,
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
                description: 'Transaction created',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(TransactionSchema)
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
        path: '/transactions/{id}',
        tags: ['Transaction'],
        summary: 'Update transaction',
        description: 'Update an existing transaction with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: TransactionParamsId.describe('ID of the transaction to update'),
            body: {
                description: 'Transaction data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateTransactionRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Transaction updated',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema()
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
        path: '/financial-account/{id}',
        tags: ['Transaction'],
        summary: 'Delete transaction',
        description: 'Delete an existing transaction with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: TransactionParamsId.describe('ID of the transaction to delete')
        },
        responses: {
            200: {
                description: 'Transaction deleted',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema()
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
}
