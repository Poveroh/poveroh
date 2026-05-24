// ------- regex patterns for validation -------
export const PASSWORD_REGEX: RegExp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const PHONE_REGEX: RegExp = /^(?:(?:\+39|0039)?\s?)?(0\d{6,10}|3\d{8,9})$/

export const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ------- session constants -------
export const SESSION_CHECK_INTERVAL = 60 * 1000

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'

// ------- job queue constants -------
export const DEFAULT_TTL_SECONDS = 3600

export const DEFAULT_QUEUE_NAME = 'poveroh.jobs'

// ------- encryption constants -------
export const KEY_ENVELOPE_ALGO_V1 = 'scrypt-aes256gcm-v1'
export const PAYLOAD_ALGO_V1 = 'aes256gcm-v1'
export const CREDENTIAL_PAYLOAD_ALGO_V1 = 'app-secret-aes256gcm-v1'

export const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const
export const KEY_BYTES = 32
export const SALT_BYTES = 16
export const IV_BYTES = 12
export const AUTH_TAG_BYTES = 16

// ------- market data credential constants -------
export const DEFAULT_MARKET_DATA_PROVIDER = {
    id: 'yahoo-finance',
    label: 'Yahoo Finance'
}
