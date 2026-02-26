import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerSessionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/sessions',
        tags: ['Session'],
        summary: 'Get all sessions',
        responses: {
            200: { description: 'List of sessions' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/sessions',
        tags: ['Session'],
        summary: 'Create session',
        responses: {
            201: { description: 'Session created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/sessions/{id}',
        tags: ['Session'],
        summary: 'Get session by ID',
        responses: {
            200: { description: 'Session found' },
            404: { description: 'Session not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/sessions/{id}',
        tags: ['Session'],
        summary: 'Update session',
        responses: {
            200: { description: 'Session updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/sessions/{id}',
        tags: ['Session'],
        summary: 'Delete session',
        responses: {
            204: { description: 'Session deleted' }
        }
    })
}
