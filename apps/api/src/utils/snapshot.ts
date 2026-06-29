import { isLastDayOfMonth } from './date'

/**
 * Decides whether a snapshot is due on a given date for a configured frequency.
 * @param frequency The user's configured snapshot frequency.
 * @param date The candidate date (defaults to UTC day boundaries).
 * @returns Whether a snapshot should be generated on that date.
 */
export function isSnapshotDay(frequency: string, date: Date): boolean {
    switch (frequency) {
        case 'DAILY':
            return true
        case 'WEEKLY':
            // Generate on Mondays.
            return date.getUTCDay() === 1
        case 'MONTHLY':
            return isLastDayOfMonth(date)
        case 'QUARTERLY':
            return isLastDayOfMonth(date) && [2, 5, 8, 11].includes(date.getUTCMonth())
        case 'SEMIANNUAL':
            return isLastDayOfMonth(date) && [5, 11].includes(date.getUTCMonth())
        case 'ANNUAL':
            return isLastDayOfMonth(date) && date.getUTCMonth() === 11
        case 'NONE':
        default:
            return false
    }
}
