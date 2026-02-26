import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerCategoryPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/categories',
        tags: ['Category'],
        summary: 'Get all categories',
        responses: {
            200: { description: 'List of categories' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/categories',
        tags: ['Category'],
        summary: 'Create category',
        responses: {
            201: { description: 'Category created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Get category by ID',
        responses: {
            200: { description: 'Category found' },
            404: { description: 'Category not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Update category',
        responses: {
            200: { description: 'Category updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/categories/{id}',
        tags: ['Category'],
        summary: 'Delete category',
        responses: {
            204: { description: 'Category deleted' }
        }
    })
}
