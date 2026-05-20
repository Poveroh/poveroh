import { StatusResponse } from '@poveroh/types'

/**
 * Service class for providing health status information
 */
export class StatusService {
    /**
     * Retrieves the current API health status
     * @returns The status response payload
     */
    getStatus(): StatusResponse {
        throw new Error('Simulated error for testing telemetry')

        return {
            status: 'ok',
            uptime: process.uptime(),
            version: 'v1',
            timestamp: new Date().toISOString()
        }
    }
}
