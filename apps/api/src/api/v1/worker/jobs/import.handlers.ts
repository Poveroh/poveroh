import type { JobHandlers } from '@poveroh/types'
import { logger } from '@poveroh/logger/server'

export const importJobHandlers: JobHandlers = {
    'import.parse-csv': async payload => {
        logger.info('Import parse job received', {
            userId: payload.userId,
            importId: payload.importId,
            fileIds: payload.fileIds
        })
    }
}
