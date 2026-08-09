/**
 * Utilities for formatting and parsing numeric strings in a locale-aware way, without rounding or
 * padding. These are used to implement the live formatting of the AmountField and NumberField.
 */
function getLocaleNumberParts(locale: string) {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.891)
    const group = parts.find(part => part.type === 'group')?.value ?? ','
    const decimal = parts.find(part => part.type === 'decimal')?.value ?? '.'

    return { group, decimal }
}

/**
 * Formats a canonical raw numeric string (digits plus at most one '.' decimal marker) into a
 * locale-grouped display string, without rounding or padding.
 * @param raw The raw numeric string to format.
 * @param locale The BCP-47 locale used to render the group/decimal separators.
 * @returns The locale-grouped display string.
 */
export function formatRawForDisplay(raw: string, locale: string): string {
    if (!raw) return ''

    const { group, decimal } = getLocaleNumberParts(locale)
    const [integerPart = '', decimalPart] = raw.split('.')
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, group)

    return decimalPart === undefined ? groupedInteger : `${groupedInteger}${decimal}${decimalPart}`
}

/**
 * Derives the number of decimal places implied by an HTML input `step` value.
 * @param step The step value passed to a numeric field (e.g. '0.01').
 * @returns The number of decimal places implied by the step, defaulting to 2.
 */
export function getDecimalPlacesFromStep(step?: string | number): number {
    if (step === undefined) return 2

    const stepString = String(step)
    const dotIndex = stepString.indexOf('.')

    return dotIndex === -1 ? 0 : stepString.length - dotIndex - 1
}

/**
 * Counts the number of raw characters (digits and decimal marker) in a display slice, ignoring
 * locale group separators.
 * @param displaySlice The slice of the display string to count.
 * @param group The locale group separator character.
 * @returns The number of raw characters in the display slice.
 */
function rawLength(displaySlice: string, group: string): number {
    let count = 0

    for (const char of displaySlice) {
        if (char !== group) count++
    }

    return count
}

/**
 * Maps a raw index (counting only digits and the decimal marker) to the corresponding
 * index in the display string.
 * @param display The display string.
 * @param rawIndex The raw index to map.
 * @param group The locale group separator character.
 * @returns The index in the display string that corresponds to the given raw index.
 */
function displayIndexForRawIndex(display: string, rawIndex: number, group: string): number {
    if (rawIndex <= 0) return 0

    let count = 0

    for (let i = 0; i < display.length; i++) {
        if (display[i] !== group) {
            count++
            if (count === rawIndex) return i + 1
        }
    }

    return display.length
}

/**
 * Finds the range of characters that differ between two strings, returning the start index and
 * @param oldStr
 * @param newStr
 * @returns The start index and the end indices of the differing ranges in both strings.
 */
function diffRange(oldStr: string, newStr: string) {
    let start = 0
    while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) start++

    let oldEnd = oldStr.length
    let newEnd = newStr.length
    while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
        oldEnd--
        newEnd--
    }

    return { start, oldEnd, newEnd }
}

/**
 * Converts a display string (digits + locale decimal/group separators) into a canonical raw
 * @param insertedDisplay
 * @param decimal
 * @param hasDecimalAlready
 * @returns The canonical raw string (digits + at most one '.' decimal marker) corresponding to the display.
 */
function toRawChars(insertedDisplay: string, decimal: string, hasDecimalAlready: boolean): string {
    let raw = ''
    let hasDecimal = hasDecimalAlready

    for (const char of insertedDisplay) {
        if (char >= '0' && char <= '9') {
            raw += char
        } else if (!hasDecimal && (char === decimal || char === '.')) {
            raw += '.'
            hasDecimal = true
        }
    }

    return raw
}

/**
 * Applies a single editing action (typing, pasting, deleting) made against a locale-grouped
 * display string onto the underlying raw numeric string, keeping both live and in sync.
 * @param oldRaw The raw numeric string (digits + at most one '.' decimal marker) before the edit.
 * @param oldDisplay The locale-grouped display string shown before the edit.
 * @param newDisplay The display string produced by the browser right after the edit was applied.
 * @param locale The BCP-47 locale used to interpret group/decimal separators.
 * @returns The updated raw value, the reformatted display value, and the caret index to restore.
 */
export function applyDisplayEdit(oldRaw: string, oldDisplay: string, newDisplay: string, locale: string) {
    const { group, decimal } = getLocaleNumberParts(locale)
    const { start, oldEnd, newEnd } = diffRange(oldDisplay, newDisplay)

    const rawStart = rawLength(oldDisplay.slice(0, start), group)
    const rawOldEnd = rawLength(oldDisplay.slice(0, oldEnd), group)

    const before = oldRaw.slice(0, rawStart)
    const after = oldRaw.slice(rawOldEnd)
    const insertedRaw = toRawChars(
        newDisplay.slice(start, newEnd),
        decimal,
        before.includes('.') || after.includes('.')
    )

    const raw = `${before}${insertedRaw}${after}`
    const display = formatRawForDisplay(raw, locale)
    const caret = displayIndexForRawIndex(display, rawStart + insertedRaw.length, group)

    return { raw, display, caret }
}
