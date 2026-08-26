// Bank statement descriptions for the same merchant rarely repeat verbatim: they carry the date of
// the payment, a masked card number, an authorisation code or a variable amount of padding. Matching
// on the raw string therefore misses most recurring payments, so both the history and the
// subscription strategies compare on this normalized form instead.
const CARD_MASK = /\b(?:x{2,}|\*{2,})\d{2,}\b/gi
const LONG_DIGIT_RUN = /\b\d{5,}\b/g
const DATE_LIKE = /\b\d{1,4}[/.-]\d{1,2}(?:[/.-]\d{1,4})?\b/g
const PUNCTUATION = /[*#/\\.,;:_'"()[\]{}+-]+/g
const WHITESPACE = /\s+/g

/**
 * Reduces a transaction description to a stable merchant key, dropping the parts that change
 * between two payments to the same merchant (dates, card masks, long reference numbers, punctuation).
 * @param title The raw description as read from the source.
 * @returns The normalized, upper-cased key, or an empty string when nothing recognisable is left.
 */
export function normalizeTitle(title: string): string {
    return title
        .toUpperCase()
        .replace(CARD_MASK, ' ')
        .replace(DATE_LIKE, ' ')
        .replace(LONG_DIGIT_RUN, ' ')
        .replace(PUNCTUATION, ' ')
        .replace(WHITESPACE, ' ')
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
