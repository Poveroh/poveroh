import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    CreateFinancialAccountMultipartRequestSchema,
    ErrorResponseSchema,
    FinancialAccountParamsId,
    UpdateFinancialAccountRequestSchema,
    GetFinancialAccountListResponseSchema,
    QueryFinancialAccountFiltersSchema,
    GetFinancialAccountResponseSchema,
    CreateFinancialAccountResponseSchema,
    UpdateFinancialAccountResponseSchema,
    DeleteFinancialAccountResponseSchema
} from '../schemas'

export const registerFinancialAccountPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/financial-account',
        tags: ['Financial Account'],
        operationId: 'getFinancialAccounts',
        summary: 'Get all financial accounts',
        description: 'Retrieve a list of all financial accounts associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryFinancialAccountFiltersSchema
        },
        responses: {
            200: {
                description: 'List of financial accounts',
                content: {
                    'application/json': {
                        schema: GetFinancialAccountListResponseSchema
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
                description: 'Account not found',
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
        path: '/financial-accounts/{id}',
        tags: ['Financial Account'],
        operationId: 'getFinancialAccountById',
        summary: 'Get financial account by ID',
        description: 'Retrieve a specific financial account by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: FinancialAccountParamsId.describe('ID of the financial account to retrieve')
        },
        responses: {
            200: {
                description: 'Financial account found',
                content: {
                    'application/json': {
                        schema: GetFinancialAccountResponseSchema
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
        method: 'post',
        path: '/financial-account',
        tags: ['Financial Account'],
        operationId: 'createFinancialAccount',
        summary: 'Create financial account',
        description: 'Create a new financial account with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Financial account data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateFinancialAccountMultipartRequestSchema,
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
                description: 'Financial account created',
                content: {
                    'application/json': {
                        schema: CreateFinancialAccountResponseSchema
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
        path: '/financial-account/{id}',
        tags: ['Financial Account'],
        operationId: 'updateFinancialAccount',
        summary: 'Update financial account',
        description: 'Update an existing financial account with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: FinancialAccountParamsId.describe('ID of the financial account to update'),
            body: {
                description: 'Financial account data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateFinancialAccountRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Financial account updated',
                content: {
                    'application/json': {
                        schema: UpdateFinancialAccountResponseSchema
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
        tags: ['Financial Account'],
        operationId: 'deleteFinancialAccount',
        summary: 'Delete financial account',
        description: 'Delete an existing financial account with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: FinancialAccountParamsId.describe('ID of the financial account to delete')
        },
        responses: {
            200: {
                description: 'Financial account deleted',
                content: {
                    'application/json': {
                        schema: DeleteFinancialAccountResponseSchema
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
        path: '/financial-account',
        tags: ['Financial Account'],
        operationId: 'deleteFinancialAccounts',
        summary: 'Delete all financial accounts',
        description: 'Delete all financial accounts associated with the user',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Financial accounts deleted',
                content: {
                    'application/json': {
                        schema: DeleteFinancialAccountResponseSchema
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
