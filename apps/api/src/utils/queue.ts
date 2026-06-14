import { createJobDispatcher } from '@poveroh/queue'
import type { JobDispatcher } from '@poveroh/types'
import { getRedisConnectionConfig } from './redis'

let dispatcher: JobDispatcher | undefined

/**
 * Returns the process-wide job dispatcher, creating it lazily on first use so importing this module does not open a Redis/queue connection (e.g. during codegen or tests) until a job is actually dispatched.
 * @returns The shared JobDispatcher bound to the configured Redis connection.
 */
export function getJobDispatcher(): JobDispatcher {
    if (!dispatcher) {
        dispatcher = createJobDispatcher(getRedisConnectionConfig())
    }
    return dispatcher
}
