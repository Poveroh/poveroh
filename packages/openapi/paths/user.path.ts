import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerUserPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/users',
        tags: ['User'],
        summary: 'Get all users',
        responses: {
            200: { description: 'List of users' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/users',
        tags: ['User'],
        summary: 'Create user',
        responses: {
            201: { description: 'User created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/users/{id}',
        tags: ['User'],
        summary: 'Get user by ID',
        responses: {
            200: { description: 'User found' },
            404: { description: 'User not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/users/{id}',
        tags: ['User'],
        summary: 'Update user',
        responses: {
            200: { description: 'User updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/users/{id}',
        tags: ['User'],
        summary: 'Delete user',
        responses: {
            204: { description: 'User deleted' }
        }
    })
}
