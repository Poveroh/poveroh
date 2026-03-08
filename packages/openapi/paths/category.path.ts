import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    CategoryParamsId,
    CreateCategoryMultipartRequestSchema,
    UpdateCategoryRequestSchema,
    QueryCategoryFiltersSchema,
    GetCategoryListResponseSchema,
    GetCategoryResponseSchema,
    UpdateCategoryResponseSchema,
    DeleteCategoryResponseSchema,
    CreateCategoryResponseSchema
} from '../schemas'

export const registerCategoryPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/categories',
        tags: ['Category'],
        summary: 'Get all categories',
        description: 'Retrieve a list of all categories associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryCategoryFiltersSchema
        },
        responses: {
            200: {
                description: 'List of categories',
                content: {
                    'application/json': {
                        schema: GetCategoryListResponseSchema
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
                description: 'Category not found',
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
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Get category by ID',
        description: 'Retrieve a specific category by its ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: CategoryParamsId.describe('ID of the category to retrieve')
        },
        responses: {
            200: {
                description: 'Category found',
                content: {
                    'application/json': {
                        schema: GetCategoryResponseSchema
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
                description: 'Category not found',
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
        path: '/categories',
        tags: ['Category'],
        summary: 'Create category',
        description: 'Create a new category with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Category data to create',
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: CreateCategoryMultipartRequestSchema,
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
                description: 'Category created',
                content: {
                    'application/json': {
                        schema: CreateCategoryResponseSchema
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
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Update category',
        description: 'Update an existing category with the provided data',
        security: [{ bearerAuth: [] }],
        request: {
            params: CategoryParamsId.describe('ID of the category to update'),
            body: {
                description: 'Category data to update',
                required: true,
                content: {
                    'application/json': {
                        schema: UpdateCategoryRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Category updated',
                content: {
                    'application/json': {
                        schema: UpdateCategoryResponseSchema
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
                description: 'Category not found',
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
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Delete category',
        description: 'Delete an existing category with the provided ID',
        security: [{ bearerAuth: [] }],
        request: {
            params: CategoryParamsId.describe('ID of the category to delete')
        },
        responses: {
            200: {
                description: 'Category deleted',
                content: {
                    'application/json': {
                        schema: DeleteCategoryResponseSchema
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
                description: 'Category not found',
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
