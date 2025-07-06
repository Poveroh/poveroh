import { z } from 'zod'

type AmountSchemaErrors = {
    required_error: string
    invalid_type_error: string
}

export const amountSchema = (errors: AmountSchemaErrors) => {
    return z
        .number({
            required_error: errors.required_error,
            invalid_type_error: errors.invalid_type_error
        })
        .positive()
}
