import { z } from 'zod'

type AmountSchemaErrors = {
    requiredError: string
    invalidTypeError: string
}

export const amountSchema = (errors: AmountSchemaErrors) => {
    return z
        .number({
            required_error: errors.requiredError,
            invalid_type_error: errors.invalidTypeError
        })
        .positive()
}
