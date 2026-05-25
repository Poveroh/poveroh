import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { ErrorResponseSchema, GetUserActivityListResponseSchema, QueryUserActivityFiltersSchema } from '../schemas'

export const registerUserActivityPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/user/me/activities',
        tags: ['User'],
        operationId: 'getAuthenticatedUserActivities',
        summary: 'Get authenticated user activities',
        description: 'Returns the audit-log activities recorded for the authenticated user, ordered by most recent.',
        security: [{ bearerAuth: [] }],
        request: {
            query: QueryUserActivityFiltersSchema
        },
        responses: {
            200: {
                description: 'User activities found',
                content: {
                    'application/json': {
                        schema: GetUserActivityListResponseSchema
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
