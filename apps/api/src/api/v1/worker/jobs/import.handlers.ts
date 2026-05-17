import type { JobHandlers } from '@poveroh/queue'
import { logger } from '@poveroh/logger'

export const importJobHandlers: JobHandlers = {
    'import.parse-csv': async payload => {
        logger.info('Import parse job received', {
            userId: payload.userId,
            importId: payload.importId,
            fileIds: payload.fileIds
        })
    }
}
