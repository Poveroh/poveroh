import { EMAIL_REGEX } from '@poveroh/types'

/**
 * Checks if the given string is a valid email address.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email is valid, otherwise `false`.
 */
export function isValidEmail(email: string): boolean {
    return !isEmpty(email) && EMAIL_REGEX.test(email)
}

/**
 * Validates if the given value is empty.
 *
 * @param value - The value to check
 * @returns `true` if the value is empty, null, undefined, or an empty string/array/object
 */
export function isEmpty(value: any): boolean {
    if (value == null) return true
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
}
