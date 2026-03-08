import { z } from '../zod'

export const MultipartRequestSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
    z.object({
        data: (dataSchema ?? z.unknown())?.optional(),
        file: z.string().openapi({ format: 'binary' }).optional().describe('Optional file upload').array()
    })
