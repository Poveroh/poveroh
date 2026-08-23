import { BankSyncCredentialInput, BankSyncError } from '@poveroh/types'

/**
 * Asserts the decrypted secret carries an access token.
 * @param providerId The provider identifier, used in the thrown error.
 * @param secret The decrypted connection secret to read the access token from.
 * @returns The access token, guaranteed to be defined.
 */
export function requireAccessToken(providerId: string, secret: BankSyncCredentialInput): string {
    if (!secret.accessToken) {
        throw new BankSyncError(providerId, 'Missing access token')
    }
    return secret.accessToken
}
