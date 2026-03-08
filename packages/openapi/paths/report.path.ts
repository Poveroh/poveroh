import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { ErrorResponseSchema, SuccessResponseSchema, ReadQuerySchema, ImportSchema, ImportFileSchema } from '../schemas'

export const registerReportPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/report/trend',
        tags: ['Report'],
        summary: 'Get trend report',
        description: 'Retrieve a trend report based on the users imports',
        security: [{ bearerAuth: [] }],
        request: {
            query: ReadQuerySchema(ImportFileSchema)
        },
        responses: {
            200: {
                description: 'Trend report retrieved',
                content: {
                    'application/json': {
                        schema: SuccessResponseSchema(ImportSchema.array())
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
}
