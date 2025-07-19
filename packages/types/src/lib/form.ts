import { InputVariantStyle } from './fields.js'
import { ITransaction } from './transaction.js'
import { LucideIcon } from 'lucide-react'

export type FormProps = {
    initialData?: ITransaction
    inEditingMode: boolean
    inputStyle?: InputVariantStyle
    dataCallback: (formData: FormData) => Promise<void>
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    startIcon?: LucideIcon
    variant?: InputVariantStyle
    endIcon?: LucideIcon
}

export type FormRef = {
    submit: () => void
}
