import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'

export const registerSnapshotPath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'get',
        path: '/snapshots',
        tags: ['Snapshot'],
        summary: 'Get all snapshots',
        responses: {
            200: { description: 'List of snapshots' }
        }
    })
    registry.registerPath({
        method: 'post',
        path: '/snapshots',
        tags: ['Snapshot'],
        summary: 'Create snapshot',
        responses: {
            201: { description: 'Snapshot created' }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/snapshots/{id}',
        tags: ['Snapshot'],
        summary: 'Get snapshot by ID',
        responses: {
            200: { description: 'Snapshot found' },
            404: { description: 'Snapshot not found' }
        }
    })
    registry.registerPath({
        method: 'put',
        path: '/snapshots/{id}',
        tags: ['Snapshot'],
        summary: 'Update snapshot',
        responses: {
            200: { description: 'Snapshot updated' }
        }
    })
    registry.registerPath({
        method: 'delete',
        path: '/snapshots/{id}',
        tags: ['Snapshot'],
        summary: 'Delete snapshot',
        responses: {
            204: { description: 'Snapshot deleted' }
        }
    })
}
