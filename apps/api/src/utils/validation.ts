import { BadRequestError } from '@/utils'
import type { z } from 'zod'

/**
 * Parses and validates the request body using the provided Zod schema. It also handles multipart form data by checking if the body contains a 'data' field, which is expected to be a JSON string.
 * @param schema The Zod schema to validate the request body against
 * @param body The raw request body, which can be either a plain object or an object containing a 'data' field for multipart form data
 * @return The parsed and validated request body, typed according to the provided Zod schema
 */
export function parseRequestBody<TSchema extends z.ZodType>(schema: TSchema, body: unknown): z.infer<TSchema> {
    try {
        const payload = isMultipartBody(body) ? JSON.parse(body.data) : body
        return schema.parse(payload)
    } catch (error) {
        throw new BadRequestError('Invalid request body', error)
    }
}

function isMultipartBody(body: unknown): body is { data: string } {
    return typeof body === 'object' && body !== null && 'data' in body && typeof body.data === 'string'
}
