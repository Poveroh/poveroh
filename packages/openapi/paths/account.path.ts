import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerAccountPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/accounts',
        tags: ['Account'],
        summary: 'Get all accounts',
        responses: {
            200: { description: 'List of accounts' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/accounts',
        tags: ['Account'],
        summary: 'Create account',
        responses: {
            201: { description: 'Account created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/accounts/{id}',
        tags: ['Account'],
        summary: 'Get account by ID',
        responses: {
            200: { description: 'Account found' },
            404: { description: 'Account not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/accounts/{id}',
        tags: ['Account'],
        summary: 'Update account',
        responses: {
            200: { description: 'Account updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/accounts/{id}',
        tags: ['Account'],
        summary: 'Delete account',
        responses: {
            204: { description: 'Account deleted' }
        }
    })
}
