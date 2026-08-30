import {
    TITLE_CARD_MASK_REGEX,
    TITLE_DATE_LIKE_REGEX,
    TITLE_LONG_DIGIT_RUN_REGEX,
    TITLE_PUNCTUATION_REGEX,
    TITLE_WHITESPACE_REGEX
} from '@poveroh/types'

/**
 * Reduces a transaction description to a stable merchant key, dropping the parts that change
 * between two payments to the same merchant (dates, card masks, long reference numbers, punctuation).
 * @param title The raw description as read from the source.
 * @returns The normalized, upper-cased key, or an empty string when nothing recognisable is left.
 */
export function normalizeTitle(title: string): string {
    return title
        .toUpperCase()
        .replace(TITLE_CARD_MASK_REGEX, ' ')
        .replace(TITLE_DATE_LIKE_REGEX, ' ')
        .replace(TITLE_LONG_DIGIT_RUN_REGEX, ' ')
        .replace(TITLE_PUNCTUATION_REGEX, ' ')
        .replace(TITLE_WHITESPACE_REGEX, ' ')
        .trim()
}

/**
 * Builds the key used to match a candidate against a past transaction or a subscription on both
 * merchant and money, the stronger of the two matching levels.
 * @param title The raw description as read from the source.
 * @param amount The transaction amount.
 * @param currency The transaction currency.
 * @returns The composite key combining the normalized title, the amount and the currency.
 */
export function buildAmountKey(title: string, amount: number, currency: string): string {
    return `${normalizeTitle(title)}|${amount.toFixed(2)}|${currency}`
}
