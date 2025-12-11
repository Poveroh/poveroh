import { EMAIL_REGEX } from '@poveroh/types'
import { isEmpty } from 'lodash'

/**
 * Checks if the given string is a valid email address.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email is valid, otherwise `false`.
 */
export function isValidEmail(email: string): boolean {
    return !isEmpty(email) && EMAIL_REGEX.test(email)
}
