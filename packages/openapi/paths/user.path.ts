import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { UserSchema } from '@poveroh/schemas'
import { UpdateUserSchemaRequest } from '../schemas'

export const registerUserPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/user',
        tags: ['User'],
        summary: 'Get user',
        description: 'Get user information and preferences',
        responses: {
            200: {
                description: 'User found',
                content: {
                    'application/json': {
                        schema: UserSchema
                    }
                }
            },
            400: { description: 'Invalid request' },
            401: { description: 'Unauthorized' },
            404: { description: 'User not found' },
            500: { description: 'Internal server error' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/user',
        tags: ['User'],
        summary: 'Update user',
        description: 'Update user preferences and information',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: UpdateUserSchemaRequest
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'User updated',
                content: {
                    'application/json': {
                        schema: UserSchema
                    }
                }
            },
            400: { description: 'Invalid request body' },
            401: { description: 'Unauthorized' },
            404: { description: 'User not found' },
            500: { description: 'Internal server error' }
        }
    })
}
