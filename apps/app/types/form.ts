import { z } from 'zod'
import { CreateImportRequest, CreateUpdateTransactionRequest, ImportData, InputVariantStyle } from '@poveroh/types'
import { LucideIcon } from 'lucide-react'
import { InputHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'
import { TransactionActionEnum, TransactionData } from '@poveroh/types'

type AmountSchemaErrors = {
    required_error: string
    invalid_type_error: string
}

export type BaseTransactionFormConfig<T extends FieldValues> = {
    type: TransactionActionEnum
    defaultValues: T
    schema: z.ZodType
    transformInitialData?: (data: TransactionData) => T
}

export const amountSchema = (errors: AmountSchemaErrors) => {
    return z
        .number({
            message: errors.invalid_type_error
        })
        .positive()
}

export type FormProps<T, U> = {
    initialData: T | null
    inEditingMode: boolean
    dataCallback: (paylod: U, files: File[]) => Promise<void>
}

export type FormRef = {
    submit: () => void
    reset: () => void
}

// ------------------------------------------------------------------------------

export type TransactionFormProps = FormProps<TransactionData, CreateUpdateTransactionRequest> & {
    inputStyle?: InputVariantStyle
}

export type ImportFormProps = FormProps<ImportData, CreateImportRequest>

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    startIcon?: LucideIcon
    variant?: InputVariantStyle
    endIcon?: LucideIcon
}
