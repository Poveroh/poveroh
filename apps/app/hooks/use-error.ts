import axios from 'axios'
import { toast } from '@poveroh/ui/components/sonner'
import { logger } from '@poveroh/logger/browser'
import type { ErrorResponse } from '@poveroh/types'

export const useError = <T>() => {
    /**
     * Resolves the message to show for a failed request, preferring the API's own error message over
     * the transport-level one, so a toast reads "Account already linked" rather than
     * "Request failed with status code 409".
     * @param error The rejection value from a query or mutation.
     * @param fallbackMessage The message to show when nothing usable can be read off the error.
     * @returns The message to display.
     */
    const resolveMessage = (error: unknown, fallbackMessage: string): string => {
        if (axios.isAxiosError<ErrorResponse>(error)) {
            return error.response?.data?.message ?? error.message
        }

        return error instanceof Error ? error.message : fallbackMessage
    }

    /**
     * Displays a user-facing error toast and logs the same message for a failed request.
     * It resolves the most descriptive message available before notifying the user.
     *
     * @param error The rejection value from a query or mutation.
     * @param fallbackMessage The message to use if no API or transport error message can be extracted.
     * @returns Always returns null to keep mutation/query handlers easy to use in the calling code.
     */
    const handleError = (error: T, fallbackMessage: string = 'Error occurred') => {
        const msg = resolveMessage(error, fallbackMessage)

        toast.error(msg)
        logger.error(msg)

        return null
    }

    return { handleError }
}
