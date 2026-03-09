import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    CreateTransactionMultipartRequestSchema,
    QueryTransactionFiltersSchema,
    TransactionParamsId,
    UpdateTransactionRequestSchema,
    GetTransactionListResponseSchema,
    GetTransactionResponseSchema,
    CreateTransactionResponseSchema,
    UpdateTransactionResponseSchema,
    DeleteTransactionResponseSchema
} from '../schemas'

export const registerTransactionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/transactions',
        tags: ['Transaction'],
        operationId: 'getTransactions',
        summary: 'Get all transactions',
        description: 'Retrieve a list of all transactions associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryTransactionFiltersSchema
        },
        responses: {
            200: {
                description: 'List of transactions',
                content: {
                    'application/json': {
                        schema: GetTransactionListResponseSchema
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
        operationId: 'getTransactionById',
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
                        schema: GetTransactionResponseSchema
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
        operationId: 'createTransaction',
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
                        schema: CreateTransactionResponseSchema
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
        operationId: 'updateTransaction',
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
                        schema: UpdateTransactionResponseSchema
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
        path: '/transactions/{id}',
        tags: ['Transaction'],
        operationId: 'deleteTransaction',
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
                        schema: DeleteTransactionResponseSchema
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
