import { toast } from '@poveroh/ui/components/sonner'
import { logger } from '@poveroh/logger/browser'

export const useError = <T>() => {
    const handleError = (error: T, fallbackMessage: string = 'Error occurred') => {
        const msg = error instanceof Error ? error.message : fallbackMessage

        toast.error(msg)
        logger.error(msg)

        return null
    }

    return { handleError }
}
