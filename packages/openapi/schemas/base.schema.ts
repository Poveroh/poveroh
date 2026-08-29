import { z } from '../zod'

/**
 * Base64-encoded binary field, the OpenAPI convention for transporting raw bytes (e.g. a
 * Uint8Array) over JSON
 */
const Base64BytesSchema = z.base64().openapi({ format: 'byte' })

/**
 * Encrypted binary payload shared by credential and secret storage: ciphertext, IV, and auth tag
 * as base64-encoded bytes, plus the algorithm identifier used to encrypt them
 */
export const EncryptedPayloadSchema = z
    .object({
        ciphertext: Base64BytesSchema.optional(),
        iv: Base64BytesSchema.optional(),
        authTag: Base64BytesSchema.optional(),
        algo: z.string().optional()
    })
    .openapi('EncryptedPayload')
