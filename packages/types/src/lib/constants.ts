import { BankSyncConnectionStatusEnum } from '@poveroh/contracts'

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

export const WORKER_LOCK_DURATION_MS = 5 * 60 * 1000

export const WORKER_STALLED_INTERVAL_MS = WORKER_LOCK_DURATION_MS

// ------- import constants -------
export const IMPORT_PROCESSING_POLL_INTERVAL = 3000

// ------- encryption constants -------
export const KEY_ENVELOPE_ALGO_V1 = 'scrypt-aes256gcm-v1'
export const PAYLOAD_ALGO_V1 = 'aes256gcm-v1'
export const CREDENTIAL_PAYLOAD_ALGO_V1 = 'app-secret-aes256gcm-v1'
export const BANK_SYNC_CREDENTIAL_ALGO_V1 = 'app-secret-aes256gcm-v1'

export const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const
export const KEY_BYTES = 32
export const SALT_BYTES = 16
export const IV_BYTES = 12
export const AUTH_TAG_BYTES = 16

// ------- application-secret encryption domains (key separation between features) -------
export const CREDENTIAL_DOMAIN_MARKET_DATA = 'market-data-credentials'
export const CREDENTIAL_DOMAIN_BANK_SYNC = 'bank-sync-credentials'

// ------- market data credential constants -------
export const DEFAULT_MARKET_DATA_PROVIDER = {
    id: 'yahoo-finance',
    label: 'Yahoo Finance'
}

// ------- bank sync -------
export const BANK_SYNC_REQUEST_TIMEOUT_MS = 10000

export const STATUS_COLOR: Record<BankSyncConnectionStatusEnum, string> = {
    PENDING: 'bg-muted-foreground text-muted-foreground',
    LINKED: 'bg-emerald-500 text-emerald-500',
    ERROR: 'bg-destructive text-destructive',
    REAUTH_REQUIRED: 'bg-amber-500 text-amber-500',
    REVOKED: 'bg-muted-foreground text-muted-foreground'
}
