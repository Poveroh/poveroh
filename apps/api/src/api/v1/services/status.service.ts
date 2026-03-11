import { StatusResponse } from '@poveroh/types/contracts'

/**
 * Service class for providing health status information
 */
export class StatusService {
    /**
     * Retrieves the current API health status
     * @returns The status response payload
     */
    static getStatus(): StatusResponse {
        return {
            status: 'ok',
            uptime: process.uptime(),
            version: 'v1',
            timestamp: new Date().toISOString()
        }
    }
}
