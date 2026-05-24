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
