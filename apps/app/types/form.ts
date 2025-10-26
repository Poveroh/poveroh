import { z } from 'zod'
import { ITransaction, InputVariantStyle, TransactionAction } from '@poveroh/types'
import { LucideIcon } from 'lucide-react'
import { InputHTMLAttributes } from 'react'
import { FieldValues } from 'react-hook-form'

type AmountSchemaErrors = {
    required_error: string
    invalid_type_error: string
}

export type BaseTransactionFormConfig<T extends FieldValues> = {
    type: TransactionAction
    defaultValues: T
    schema: z.ZodTypeAny
    transformInitialData?: (data: ITransaction) => T
}

type ExpensesAmounts = Array<{ amount: number; accountId: string }>

export type ExpensesFormData = {
    title: string
    date: string
    currency: string
    totalAmount: number
    multipleAmount: boolean
    amounts?: ExpensesAmounts
    totalAccountId?: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
}

export type IncomeFormData = {
    title: string
    date: string
    amount: number
    currency: string
    accountId: string
    categoryId: string
    subcategoryId: string
    note: string
    ignore: boolean
}

export type TransferFormData = {
    title: string
    date: string
    amount: number
    currency: string
    from: string
    to: string
    note: string
    ignore: boolean
}

export type FormMode = ExpensesFormData | IncomeFormData | TransferFormData

export const amountSchema = (errors: AmountSchemaErrors) => {
    return z
        .number({
            required_error: errors.required_error,
            invalid_type_error: errors.invalid_type_error
        })
        .positive()
}

export type FormProps<T> = {
    initialData?: T | null
    inEditingMode: boolean
    dataCallback: (formData: FormData) => Promise<void>
}

export type TransactionFormProps = FormProps<ITransaction> & {
    inputStyle?: InputVariantStyle
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    startIcon?: LucideIcon
    variant?: InputVariantStyle
    endIcon?: LucideIcon
}

export type FormRef = {
    submit: () => void
}
