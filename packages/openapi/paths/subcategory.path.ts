import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerSubcategoryPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/subcategories',
        tags: ['Subcategory'],
        summary: 'Get all subcategories',
        responses: {
            200: { description: 'List of subcategories' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/subcategories',
        tags: ['Subcategory'],
        summary: 'Create subcategory',
        responses: {
            201: { description: 'Subcategory created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        summary: 'Get subcategory by ID',
        responses: {
            200: { description: 'Subcategory found' },
            404: { description: 'Subcategory not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        summary: 'Update subcategory',
        responses: {
            200: { description: 'Subcategory updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/subcategories/{id}',
        tags: ['Subcategory'],
        summary: 'Delete subcategory',
        responses: {
            204: { description: 'Subcategory deleted' }
        }
    })
}
