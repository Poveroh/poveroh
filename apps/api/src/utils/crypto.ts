import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { InternalServerError, UnauthorizedError } from './errors'

// Algorithm identifiers persisted with each ciphertext so the scheme can evolve later
// without losing the ability to decrypt records produced by older versions.
export const KEY_ENVELOPE_ALGO_V1 = 'scrypt-aes256gcm-v1'
export const PAYLOAD_ALGO_V1 = 'aes256gcm-v1'
export const CREDENTIAL_PAYLOAD_ALGO_V1 = 'app-secret-aes256gcm-v1'

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const
const KEY_BYTES = 32
const SALT_BYTES = 16
const IV_BYTES = 12
const AUTH_TAG_BYTES = 16

export type EncryptedRecord = {
    ciphertext: Buffer
    iv: Buffer
    authTag: Buffer
}

export type EncryptionEnvelope = {
    salt: Buffer
    wrappedKey: Buffer
    wrapIv: Buffer
    wrapTag: Buffer
    algo: string
}

// Derives a 32 byte symmetric key from a password-equivalent secret using scrypt.
// The input is expected to already be a hashed password (the frontend sends sha256(plaintext)),
// so the KDF is hardening against weak passwords in case the DB and the password hash leak together.
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
        // GCM authentication failures intentionally collapse into a generic 401
        // so we never leak whether the password or the ciphertext was tampered with.
        throw new UnauthorizedError('Invalid password or corrupted credential payload')
    }
}

// Derives a deterministic application key for server-side secret storage.
function deriveApplicationKey(secret: string): Buffer {
    if (!secret || typeof secret !== 'string') {
        throw new InternalServerError('Cannot derive application encryption key from empty secret')
    }

    return createHash('sha256').update(`poveroh:market-data-credentials:${secret}`).digest()
}

// Generates a fresh user encryption key (UEK) and wraps it with a key derived from the user secret.
// The UEK itself is what later encrypts each provider credential.
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

// Unwraps an existing UEK using the user secret. Wrong secret produces an UnauthorizedError
// thanks to GCM authentication, which is exactly the behavior we want for password verification.
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

// Re-wraps an unwrapped UEK with a new salt and new derived key. Used during password change
// so previously stored credentials remain decryptable after the password rotation.
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

// Encrypts an arbitrary UTF-8 plaintext with the unwrapped UEK.
export function encryptPayload(uek: Buffer, plaintext: string): EncryptedRecord {
    if (uek.length !== KEY_BYTES) {
        throw new InternalServerError('Invalid UEK length')
    }

    return encryptWithKey(uek, Buffer.from(plaintext, 'utf8'))
}

// Decrypts a payload produced by encryptPayload. Failure is surfaced as 401 to avoid leaking details.
export function decryptPayload(uek: Buffer, record: EncryptedRecord): string {
    return decryptWithKey(uek, record).toString('utf8')
}

// Encrypts provider credentials with a server-side application secret.
export function encryptPayloadWithApplicationSecret(secret: string, plaintext: string): EncryptedRecord {
    const key = deriveApplicationKey(secret)
    try {
        return encryptWithKey(key, Buffer.from(plaintext, 'utf8'))
    } finally {
        key.fill(0)
    }
}

// Decrypts provider credentials encrypted with encryptPayloadWithApplicationSecret.
export function decryptPayloadWithApplicationSecret(secret: string, record: EncryptedRecord): string {
    const key = deriveApplicationKey(secret)
    try {
        return decryptWithKey(key, record).toString('utf8')
    } finally {
        key.fill(0)
    }
}

// Constant-time comparison helper used when validating sensitive equality checks.
export function safeEquals(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}

// Prisma's Bytes columns are typed as Uint8Array<ArrayBuffer>; Node's Buffer extends Uint8Array
// but with a wider ArrayBufferLike, which TS rejects on assignment. This helper copies the bytes
// into a fresh ArrayBuffer-backed Uint8Array so the value is assignable without any casts.
export function toPrismaBytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
    const arrayBuffer = new ArrayBuffer(buffer.byteLength)
    const copy = new Uint8Array(arrayBuffer)
    copy.set(buffer)
    return copy
}
