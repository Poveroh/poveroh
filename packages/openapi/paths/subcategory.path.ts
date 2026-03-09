import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    SubcategoryParamsId,
    CreateSubcategoryMultipartRequestSchema,
    UpdateSubcategoryRequestSchema,
    QuerySubcategoryFiltersSchema,
    GetSubcategoryListResponseSchema,
    GetSubcategoryResponseSchema,
    CreateSubcategoryResponseSchema,
    UpdateSubcategoryResponseSchema,
    DeleteSubcategoryResponseSchema
} from '../schemas'

export const registerSubcategoryPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/subcategories',
        tags: ['Subcategory'],
        operationId: 'getSubcategories',
        summary: 'Get all subcategories',
        description: 'Retrieve a list of all subcategories associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QuerySubcategoryFiltersSchema
        },
        responses: {
            200: {
                description: 'List of subcategories',
                content: {
                    'application/json': {
                        schema: GetSubcategoryListResponseSchema
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
                description: 'Subcategory not found',
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
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        operationId: 'getSubcategoryById',
        summary: 'Get subcategory by ID',
        description: 'Retrieve a specific subcategory by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubcategoryParamsId.describe('ID of the subcategory to retrieve')
        },
        responses: {
            200: {
                description: 'Subcategory found',
                content: {
                    'application/json': {
                        schema: GetSubcategoryResponseSchema
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
                description: 'Subcategory not found',
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
        path: '/subcategories',
        tags: ['Subcategory'],
        operationId: 'createSubcategory',
        summary: 'Create subcategory',
        description: 'Create a new subcategory with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Subcategory data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateSubcategoryMultipartRequestSchema,
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
                description: 'Subcategory created',
                content: {
                    'application/json': {
                        schema: CreateSubcategoryResponseSchema
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
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        operationId: 'updateSubcategory',
        summary: 'Update subcategory',
        description: 'Update an existing subcategory with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubcategoryParamsId.describe('ID of the subcategory to update'),
            body: {
                description: 'Subcategory data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateSubcategoryRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Subcategory updated',
                content: {
                    'application/json': {
                        schema: UpdateSubcategoryResponseSchema
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
                description: 'Subcategory not found',
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
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        operationId: 'deleteSubcategory',
        summary: 'Delete subcategory',
        description: 'Delete an existing subcategory with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: SubcategoryParamsId.describe('ID of the subcategory to delete')
        },
        responses: {
            200: {
                description: 'Subcategory deleted',
                content: {
                    'application/json': {
                        schema: DeleteSubcategoryResponseSchema
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
                description: 'Subcategory not found',
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
