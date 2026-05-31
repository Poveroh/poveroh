import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { InternalServerError, UnauthorizedError } from './errors'
import {
    KEY_BYTES,
    SCRYPT_PARAMS,
    EncryptedRecord,
    IV_BYTES,
    AUTH_TAG_BYTES,
    EncryptionEnvelope,
    SALT_BYTES,
    KEY_ENVELOPE_ALGO_V1
} from '@poveroh/types'

/**
 * Derives a symmetric key from a secret and salt using scrypt.
 * @param secret The secret from which to derive the key.
 * @param salt The salt to use in the key derivation.
 * @returns The derived key as a Buffer.
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
    if (!secret || typeof secret !== 'string') {
        throw new InternalServerError('Cannot derive key from empty secret')
    }

    return scryptSync(secret, salt, KEY_BYTES, SCRYPT_PARAMS)
}

function encryptWithKey(key: Buffer, plaintext: Buffer): EncryptedRecord {
    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
    const authTag = cipher.getAuthTag()

    return { ciphertext, iv, authTag }
}

function decryptWithKey(key: Buffer, record: EncryptedRecord): Buffer {
    if (record.authTag.length !== AUTH_TAG_BYTES) {
        throw new InternalServerError('Invalid authentication tag length')
    }

    try {
        const decipher = createDecipheriv('aes-256-gcm', key, record.iv)
        decipher.setAuthTag(record.authTag)
        return Buffer.concat([decipher.update(record.ciphertext), decipher.final()])
    } catch {
        throw new UnauthorizedError('Invalid password or corrupted credential payload')
    }
}

/**
 * Derives a key from the application secret and uses it to encrypt the plaintext credential payload.
 * @param secret  The application secret from which to derive the encryption key.
 * @returns The encrypted credential record containing the ciphertext, IV, and auth tag.
 */
function deriveApplicationKey(secret: string): Buffer {
    if (!secret || typeof secret !== 'string') {
        throw new InternalServerError('Cannot derive application encryption key from empty secret')
    }

    return createHash('sha256').update(`poveroh:market-data-credentials:${secret}`).digest()
}

/**
 *  Generates a random UEK and wraps it with a KEK derived from the user secret. The returned envelope contains
 * @param secret  The user secret from which to derive the KEK for wrapping the UEK. This is typically the user's password.
 * @returns The unwrapped UEK and the encryption envelope containing the wrapped UEK and parameters needed for unwrapping.
 */
export function generateAndWrapUserEncryptionKey(secret: string): { uek: Buffer; envelope: EncryptionEnvelope } {
    const uek = randomBytes(KEY_BYTES)
    const salt = randomBytes(SALT_BYTES)
    const kek = deriveKey(secret, salt)
    const wrapped = encryptWithKey(kek, uek)

    return {
        uek,
        envelope: {
            salt,
            wrappedKey: wrapped.ciphertext,
            wrapIv: wrapped.iv,
            wrapTag: wrapped.authTag,
            algo: KEY_ENVELOPE_ALGO_V1
        }
    }
}

/**
 *  Unwraps the UEK from the provided envelope using a KEK derived from the user secret. The UEK can then be used for encrypting and decrypting provider credentials.
 * @param secret  The user secret from which to derive the KEK for unwrapping the UEK. This is typically the user's password.
 * @param envelope  The encryption envelope containing the wrapped UEK and parameters needed for unwrapping.
 * @returns The unwrapped UEK as a Buffer.
 */
export function unwrapUserEncryptionKey(secret: string, envelope: EncryptionEnvelope): Buffer {
    if (envelope.algo !== KEY_ENVELOPE_ALGO_V1) {
        throw new InternalServerError(`Unsupported encryption envelope algo: ${envelope.algo}`)
    }

    const kek = deriveKey(secret, envelope.salt)
    return decryptWithKey(kek, {
        ciphertext: envelope.wrappedKey,
        iv: envelope.wrapIv,
        authTag: envelope.wrapTag
    })
}

/**
 * Re-wraps an unwrapped UEK with a new salt and new derived key. Used during password change
 * so previously stored credentials remain decryptable after the password rotation.
 * @param uek  The unwrapped UEK to be re-wrapped.
 * @param newSecret  The new user secret from which to derive the KEK for wrapping the UEK.
 * @returns The new encryption envelope containing the re-wrapped UEK and parameters needed for unwrapping.
 */
export function rewrapUserEncryptionKey(uek: Buffer, newSecret: string): EncryptionEnvelope {
    if (uek.length !== KEY_BYTES) {
        throw new InternalServerError('Invalid UEK length')
    }

    const salt = randomBytes(SALT_BYTES)
    const kek = deriveKey(newSecret, salt)
    const wrapped = encryptWithKey(kek, uek)

    return {
        salt,
        wrappedKey: wrapped.ciphertext,
        wrapIv: wrapped.iv,
        wrapTag: wrapped.authTag,
        algo: KEY_ENVELOPE_ALGO_V1
    }
}

/**
 * Encrypts an arbitrary UTF-8 plaintext with the unwrapped UEK.
 * @param uek  The unwrapped UEK to use for encryption.
 * @param plaintext  The plaintext string to encrypt.
 * @returns The encrypted record containing the ciphertext and encryption parameters.
 */
export function encryptPayload(uek: Buffer, plaintext: string): EncryptedRecord {
    if (uek.length !== KEY_BYTES) {
        throw new InternalServerError('Invalid UEK length')
    }

    return encryptWithKey(uek, Buffer.from(plaintext, 'utf8'))
}

/**
 * Decrypts a payload produced by encryptPayload. Failure is surfaced as 401 to avoid leaking details.
 * @param uek  The unwrapped UEK to use for decryption.
 * @param record  The encrypted record containing the ciphertext and encryption parameters.
 * @returns The decrypted plaintext string.
 */
export function decryptPayload(uek: Buffer, record: EncryptedRecord): string {
    return decryptWithKey(uek, record).toString('utf8')
}

/**
 * Derives a key from the application secret and uses it to encrypt the plaintext credential payload.
 * @param secret  The application secret from which to derive the encryption key.
 * @returns The encrypted credential record containing the ciphertext, IV, and auth tag.
 */
export function encryptPayloadWithApplicationSecret(secret: string, plaintext: string): EncryptedRecord {
    const key = deriveApplicationKey(secret)
    try {
        return encryptWithKey(key, Buffer.from(plaintext, 'utf8'))
    } finally {
        key.fill(0)
    }
}

/**
 * Derives a key from the application secret and uses it to decrypt the encrypted credential record.
 * @param secret  The application secret from which to derive the decryption key.
 * @param record  The encrypted credential record containing the ciphertext, IV, and auth tag.
 * @returns The decrypted plaintext credential payload.
 */
export function decryptPayloadWithApplicationSecret(secret: string, record: EncryptedRecord): string {
    const key = deriveApplicationKey(secret)
    try {
        return decryptWithKey(key, record).toString('utf8')
    } finally {
        key.fill(0)
    }
}

/**
 * Compares two Buffers in a way that is safe against timing attacks. Returns true if the Buffers are equal, false otherwise.
 * @param a The first Buffer to compare.
 * @param b The second Buffer to compare.
 * @returns  True if the Buffers are equal, false otherwise.
 */
export function safeEquals(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}

/**
 * Converts a Node.js Buffer to a Prisma-compatible Uint8Array backed by an ArrayBuffer.
 * @param buffer The Buffer to convert.
 * @returns A Uint8Array backed by an ArrayBuffer containing the same bytes as the input Buffer.
 */
export function toPrismaBytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength)
    const copy = new Uint8Array(arrayBuffer)
    copy.set(buffer)
    return copy
}
