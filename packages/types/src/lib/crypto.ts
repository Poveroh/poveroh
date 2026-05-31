/// <reference types="node" />

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

export type UpdateCredentialRecordRequest = {
    ciphertext: Uint8Array<ArrayBuffer>
    iv: Uint8Array<ArrayBuffer>
    authTag: Uint8Array<ArrayBuffer>
    algo: string
}
