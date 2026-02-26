import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerTransactionPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/transactions',
        tags: ['Transaction'],
        summary: 'Get all transactions',
        responses: {
            200: { description: 'List of transactions' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/transactions',
        tags: ['Transaction'],
        summary: 'Create transaction',
        responses: {
            201: { description: 'Transaction created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/transactions/{id}',
        tags: ['Transaction'],
        summary: 'Get transaction by ID',
        responses: {
            200: { description: 'Transaction found' },
            404: { description: 'Transaction not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/transactions/{id}',
        tags: ['Transaction'],
        summary: 'Update transaction',
        responses: {
            200: { description: 'Transaction updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/transactions/{id}',
        tags: ['Transaction'],
        summary: 'Delete transaction',
        responses: {
            204: { description: 'Transaction deleted' }
        }
    })
}
