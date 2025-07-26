import { toast } from '@poveroh/ui/components/sonner'

export const useError = () => {
    const handleError = (error: unknown, fallbackMessage: string) => {
        const msg = error instanceof Error ? error.message : fallbackMessage

        toast.error(msg)
        console.error(msg)

        return null
    }

    return { handleError }
}
