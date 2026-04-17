import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    ImportParamsId,
    CreateImportMultipartRequestSchema,
    GetImportResponseSchema,
    QueryImportFiltersSchema,
    GetImportListResponseSchema,
    CreateImportResponseSchema,
    UpdateImportResponseSchema,
    DeleteImportResponseSchema,
    UpdateImportRequestSchema,
    GetImportTransactionsResponseSchema,
    ImportTemplateActionParams,
    CreateImportTemplateResponseSchema,
    ApproveImportTransactionsRequestSchema,
    ApproveImportTransactionsResponseSchema
} from '../schemas'

export const registerImportPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/imports',
        tags: ['Import'],
        operationId: 'getImports',
        summary: 'Get all imports',
        description: 'Retrieve a list of all imports associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryImportFiltersSchema
        },
        responses: {
            200: {
                description: 'List of imports',
                content: {
                    'application/json': {
                        schema: GetImportListResponseSchema
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
                description: 'Import not found',
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
        path: '/imports/{id}',
        tags: ['Import'],
        operationId: 'getImportById',
        summary: 'Get import by ID',
        description: 'Retrieve a specific import by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import to retrieve')
        },
        responses: {
            200: {
                description: 'Import retrieved',
                content: {
                    'application/json': {
                        schema: GetImportResponseSchema
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
                description: 'Import not found',
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
        path: '/imports/{id}/transactions',
        tags: ['Import'],
        operationId: 'getImportTransactionsById',
        summary: 'Get import transactions by ID',
        description: 'Retrieve transactions for a specific import by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import to retrieve')
        },
        responses: {
            200: {
                description: 'Import transactions retrieved',
                content: {
                    'application/json': {
                        schema: GetImportTransactionsResponseSchema
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
                description: 'Import transactions not found',
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
        path: '/imports/{id}/transactions/approve',
        tags: ['Import'],
        operationId: 'approveImportTransactions',
        summary: 'Approve or reject import transactions',
        description: 'Bulk approve or reject transactions for a specific import',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import'),
            body: {
                description: 'List of transactions with their new statuses',
                required: true,
                content: {
                    'application/json': {
                        schema: ApproveImportTransactionsRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Transactions updated',
                content: {
                    'application/json': {
                        schema: ApproveImportTransactionsResponseSchema
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
                description: 'Import not found',
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
        path: '/imports',
        tags: ['Import'],
        operationId: 'createImport',
        summary: 'Create import',
        description: 'Create a new import with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Import data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateImportMultipartRequestSchema,
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
                description: 'Import created',
                content: {
                    'application/json': {
                        schema: CreateImportResponseSchema
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
        method: 'post',
        path: '/imports/template/{action}',
        tags: ['Import'],
        operationId: 'createImportTemplate',
        summary: 'Create import template',
        description: 'Create a new import template with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportTemplateActionParams.describe('Action to perform on the import template')
        },
        responses: {
            200: {
                description: 'Import created',
                content: {
                    'application/json': {
                        schema: CreateImportTemplateResponseSchema
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
        path: '/imports/complete/{id}',
        tags: ['Import'],
        operationId: 'completeImport',
        summary: 'Complete import',
        description: 'Mark an existing import as complete',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import to complete')
        },
        responses: {
            200: {
                description: 'Import completed',
                content: {
                    'application/json': {
                        schema: UpdateImportResponseSchema
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
                description: 'Import not found',
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
        path: '/imports/{id}',
        tags: ['Import'],
        operationId: 'updateImport',
        summary: 'Update import',
        description: 'Update an existing import with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import to update'),
            body: {
                description: 'Import data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateImportRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Import updated',
                content: {
                    'application/json': {
                        schema: UpdateImportResponseSchema
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
                description: 'Import not found',
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
        path: '/imports/{id}',
        tags: ['Import'],
        operationId: 'deleteImport',
        summary: 'Delete import',
        description: 'Delete an existing import with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: ImportParamsId.describe('ID of the import to delete')
        },
        responses: {
            200: {
                description: 'Import deleted',
                content: {
                    'application/json': {
                        schema: DeleteImportResponseSchema
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
                description: 'Import not found',
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
        path: '/imports',
        tags: ['Import'],
        operationId: 'deleteImports',
        summary: 'Delete all imports',
        description: 'Delete all imports associated with the user',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Imports deleted',
                content: {
                    'application/json': {
                        schema: DeleteImportResponseSchema
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
