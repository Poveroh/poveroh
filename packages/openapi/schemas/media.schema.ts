import { z } from '../zod'

/**
 * Multipart request schema for handling file uploads along with optional data in the same request.
 * This schema is designed to accommodate scenarios where a client needs to send both structured data and files in a single multipart/form-data request.
 * The `data` field can be any structured data defined by the provided `dataSchema`, while the `file` field allows for one or more file uploads,
 * represented as an array of strings with a binary format. This schema is flexible and can be used across various endpoints that require file uploads
 * alongside other data.
 * @param dataSchema The Zod schema defining the structure of the optional data field.
 * @returns A Zod schema for a multipart request with optional data and file uploads.
 */
export const MultipartRequestSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
    z.object({
        data: (dataSchema ?? z.unknown())?.optional(),
        file: z.string().openapi({ format: 'binary' }).optional().describe('Optional file upload').array()
    })
