import { AxiosError } from 'axios'

export const useError = () => {
    const handleError = (error: unknown) => {
        console.error(error)

        let errorMessage: string = 'Error occurred'

        if (error instanceof AxiosError) {
            errorMessage = error.response?.data.message || error.message

            if (error.status == 403) {
                window.location.href = '/logout'
            }
        } else if (error instanceof Error) {
            errorMessage = error.message
        }

        return errorMessage
    }

    return { handleError }
}
