import { z } from '../zod'

export const MultipartRequestSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        data: dataSchema.optional(),
        file: z.string().openapi({ format: 'binary' }).optional().describe('Optional file upload').array()
    })
