import type { JobHandlers } from '@poveroh/types'
import { DEFAULT_USER } from '@poveroh/types'
import { contextService } from '../../modules/base/context.service'
import { ImportProcessingService } from '../../modules/imports/processing/import-processing.service'

export const importJobHandlers: JobHandlers = {
    'import.process': async ({ userId, importId }) => {
        await contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, async () => {
            await new ImportProcessingService().process(importId)
        })
    }
}
