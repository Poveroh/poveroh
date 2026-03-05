import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { ErrorResponseSchema, SuccessResponseSchema, ReadQuerySchema } from '../schemas'
import {
    SubcategoryFiltersSchema,
    SubcategorySchema,
    SubcategoryParamsId,
    CreateSubcategoryMultipartRequestSchema,
    UpdateSubcategoryRequestSchema
} from '../schemas/subcategory.schema'

export const registerSubcategoryPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/subcategories',
        tags: ['Subcategory'],
        summary: 'Get all subcategories',
        description: 'Retrieve a list of all subcategories associated with the user',
        security: [{ bearerAuth: [] }],
        request: {
            query: ReadQuerySchema(SubcategoryFiltersSchema)
        },
        responses: {
            200: {
                description: 'List of subcategories',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(SubcategorySchema.array())
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
                        schema: SuccessResponseSchema(SubcategorySchema)
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
                        schema: SuccessResponseSchema(SubcategorySchema)
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
