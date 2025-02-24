export const PASSWORD_REGEX: RegExp =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const PHONE_REGEX: RegExp = /^(?:(?:\+39|0039)?\s?)?(0\d{6,10}|3\d{8,9})$/

export const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
